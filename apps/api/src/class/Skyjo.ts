import { Constants } from "@/constants.js"
import { CError } from "@/utils/CError.js"
import { Logger } from "@/utils/Logger.js"
import type { DbGame } from "database/schema"
import type { DbPlayer } from "database/schema"
import {
  CONNECTION_STATUS,
  ERROR,
  GAME_STATUS,
  type GameStatus,
  LAST_TURN_STATUS,
  type LastTurnStatus,
  ROUND_STATUS,
  type RoundStatus,
  TURN_STATUS,
  type TurnStatus,
} from "shared/constants"
import type { SkyjoToJson } from "shared/types/skyjo"
import { shuffle } from "../utils/shuffle.js"
import { SkyjoCard } from "./SkyjoCard.js"
import { SkyjoPlayer } from "./SkyjoPlayer.js"
import { SkyjoSettings } from "./SkyjoSettings.js"

const SHUFFLE_ITERATIONS = 3

interface SkyjoInterface {
  id: string
  code: string
  status: GameStatus
  players: SkyjoPlayer[]
  turn: number
  adminId: string
  settings: SkyjoSettings

  selectedCardValue: number | null
  firstToFinishPlayerId: string | null
  turnStatus: TurnStatus
  lastTurnStatus: LastTurnStatus

  start(): void
  checkAllPlayersRevealedCards(count: number): void
  drawCard(): void
  pickFromDiscard(): void
  discardCard(value: number): void
  replaceCard(column: number, row: number): void
  turnCard(player: SkyjoPlayer, column: number, row: number): void
  nextTurn(): void
  resetRound(): void
  toJson(): SkyjoToJson
}

export class Skyjo implements SkyjoInterface {
  id: string = crypto.randomUUID()
  code: string = Math.random().toString(36).substring(2, 10)
  adminId: string
  settings: SkyjoSettings
  status: GameStatus = GAME_STATUS.LOBBY
  players: SkyjoPlayer[] = []
  turn: number = 0
  discardPile: number[] = []
  drawPile: number[] = []

  selectedCardValue: number | null = null
  turnStatus: TurnStatus = TURN_STATUS.CHOOSE_A_PILE
  lastTurnStatus: LastTurnStatus = LAST_TURN_STATUS.TURN
  roundStatus: RoundStatus = ROUND_STATUS.WAITING_PLAYERS_TO_TURN_INITIAL_CARDS
  roundNumber: number = 1
  firstToFinishPlayerId: string | null = null

  createdAt: Date
  updatedAt: Date

  constructor(
    adminPlayerId: string,
    settings: SkyjoSettings = new SkyjoSettings(),
  ) {
    this.adminId = adminPlayerId
    this.settings = settings

    const now = new Date()
    this.createdAt = now
    this.updatedAt = now
  }

  populate(game: DbGame, { players }: { players: DbPlayer[] }) {
    this.id = game.id
    this.code = game.code
    this.status = game.status
    this.turn = game.turn
    this.discardPile = game.discardPile
    this.drawPile = game.drawPile

    this.selectedCardValue = game.selectedCardValue
    this.turnStatus = game.turnStatus
    this.lastTurnStatus = game.lastTurnStatus
    this.roundStatus = game.roundStatus
    this.roundNumber = game.roundNumber

    this.firstToFinishPlayerId = game.firstToFinishPlayerId

    this.createdAt = game.createdAt
    this.updatedAt = game.updatedAt

    this.players = players.map((player) => new SkyjoPlayer().populate(player))

    this.settings = new SkyjoSettings().populate(game)

    return this
  }

  getConnectedPlayers(playerIdsToExclude: string[] = []) {
    return this.players.filter(
      (player) =>
        player.connectionStatus !== CONNECTION_STATUS.DISCONNECTED &&
        !playerIdsToExclude?.includes(player.id),
    )
  }

  getCurrentPlayer() {
    return this.players[this.turn]
  }

  getPlayerById(playerId: string) {
    return this.players.find((player) => {
      return player.id === playerId
    })
  }

  addPlayer(player: SkyjoPlayer) {
    if (this.isFull()) {
      throw new CError("Cannot add player, game is full", {
        code: ERROR.GAME_IS_FULL,
        level: "warn",
        meta: {
          game: this,
          gameCode: this.code,
          player,
        },
      })
    }

    this.players.push(player)
  }

  removePlayer(playerId: string) {
    this.players = this.players.filter((player) => player.id !== playerId)
  }

  isAdmin(playerId: string) {
    return this.adminId === playerId
  }

  isFull() {
    return this.getConnectedPlayers().length >= this.settings.maxPlayers
  }

  checkTurn(playerId: string) {
    return this.players[this.turn].id === playerId
  }

  haveAtLeastMinPlayersConnected() {
    return this.getConnectedPlayers().length >= Constants.MIN_PLAYERS
  }

  start() {
    if (this.getConnectedPlayers().length < Constants.MIN_PLAYERS) {
      throw new CError(
        `Game cannot start with less than ${Constants.MIN_PLAYERS} players`,
        {
          code: ERROR.TOO_FEW_PLAYERS,
          level: "warn",
          meta: {
            game: this,
          },
        },
      )
    }

    this.resetRound()
    this.lastTurnStatus = LAST_TURN_STATUS.TURN
    if (this.settings.initialTurnedCount === 0)
      this.roundStatus = ROUND_STATUS.PLAYING

    this.status = GAME_STATUS.PLAYING
    this.turn = Math.floor(Math.random() * this.players.length)

    Logger.info(`Game ${this.code} started`)
  }

  checkAllPlayersRevealedCards(count: number) {
    const allPlayersTurnedCards = this.getConnectedPlayers().every((player) =>
      player.hasRevealedCardCount(count),
    )

    if (allPlayersTurnedCards) {
      this.roundStatus = ROUND_STATUS.PLAYING
      this.setFirstPlayerToStart()
    }
  }

  drawCard() {
    if (this.drawPile.length === 0) this.reloadDrawPile()

    const cardValue = this.drawPile.shift()!
    this.selectedCardValue = cardValue

    this.turnStatus = TURN_STATUS.THROW_OR_REPLACE
    this.lastTurnStatus = LAST_TURN_STATUS.PICK_FROM_DRAW_PILE
  }

  pickFromDiscard() {
    if (this.discardPile.length === 0) return
    const cardValue = this.discardPile.pop()!
    this.selectedCardValue = cardValue

    this.turnStatus = TURN_STATUS.REPLACE_A_CARD
    this.lastTurnStatus = LAST_TURN_STATUS.PICK_FROM_DISCARD_PILE
  }

  discardCard(value: number) {
    this.discardPile.push(value)
    this.selectedCardValue = null

    this.turnStatus = TURN_STATUS.TURN_A_CARD
    this.lastTurnStatus = LAST_TURN_STATUS.THROW
  }

  replaceCard(column: number, row: number) {
    const player = this.getCurrentPlayer()
    const oldCardValue = player.cards[column][row].value
    player.replaceCard(column, row, this.selectedCardValue!)
    this.discardCard(oldCardValue)
    this.lastTurnStatus = LAST_TURN_STATUS.REPLACE
  }

  turnCard(player: SkyjoPlayer, column: number, row: number) {
    player.turnCard(column, row)
    this.lastTurnStatus = LAST_TURN_STATUS.TURN
  }

  nextTurn() {
    const currentPlayer = this.getCurrentPlayer()

    this.checkCardsToDiscard(currentPlayer)

    this.checkAndSetFirstPlayerToFinish(currentPlayer)

    if (this.roundStatus === ROUND_STATUS.LAST_LAP) {
      currentPlayer.hasPlayedLastTurn = true
      this.lastTurnStatus = LAST_TURN_STATUS.TURN
      currentPlayer.turnAllCards()

      this.checkEndOfRound()
    }

    this.turnStatus = TURN_STATUS.CHOOSE_A_PILE
    this.turn = this.getNextTurn()
  }

  checkEndOfRound() {
    const allPlayersHavePlayedLastTurn = this.getConnectedPlayers().every(
      (player) => player.hasPlayedLastTurn,
    )

    if (allPlayersHavePlayedLastTurn) this.endRound()
  }

  endRound() {
    this.players.forEach((player) => {
      player.turnAllCards()
      this.checkCardsToDiscard(player)
      player.finalRoundScore()
    })

    this.multiplyScoreForFirstPlayer()

    this.roundStatus = ROUND_STATUS.OVER

    this.checkEndOfGame()
  }

  startNewRound() {
    this.roundNumber++
    this.initializeRound()
  }

  restartGameIfAllPlayersWantReplay() {
    if (this.getConnectedPlayers().every((player) => player.wantsReplay)) {
      this.resetRound()
      this.status = GAME_STATUS.LOBBY
      this.updatedAt = new Date()
      this.turn = 0
    }
  }

  resetRound() {
    this.roundNumber = 1
    this.resetPlayers()
    this.initializeRound()
  }

  toJson() {
    return {
      code: this.code,
      status: this.status,
      turn: this.turn,
      adminId: this.adminId,
      players: this.players.map((player) => player.toJson(this.adminId)),
      selectedCardValue: this.selectedCardValue,
      lastDiscardCardValue: this.discardPile[this.discardPile.length - 1],
      roundStatus: this.roundStatus,
      turnStatus: this.turnStatus,
      lastTurnStatus: this.lastTurnStatus,
      settings: this.settings.toJson(),
      updatedAt: this.updatedAt,
    } satisfies SkyjoToJson
  }

  //#region private methods

  private initializeCardPiles() {
    const defaultCards = [
      ...Array(5).fill(-2),
      ...Array(10).fill(-1),
      ...Array(15).fill(0),
      ...Array(10).fill(1),
      ...Array(10).fill(2),
      ...Array(10).fill(3),
      ...Array(10).fill(4),
      ...Array(10).fill(5),
      ...Array(10).fill(6),
      ...Array(10).fill(7),
      ...Array(10).fill(8),
      ...Array(10).fill(9),
      ...Array(10).fill(10),
      ...Array(10).fill(11),
      ...Array(10).fill(12),
    ]

    this.drawPile = shuffle(defaultCards, SHUFFLE_ITERATIONS)
    this.discardPile = []
  }

  private resetRoundPlayers() {
    this.getConnectedPlayers().forEach((player) => {
      player.resetRound()
    })
  }

  private givePlayersCards() {
    this.getConnectedPlayers().forEach((player) => {
      const cards = this.drawPile.splice(0, 12)
      player.setCards(cards, this.settings)
    })
  }

  private initializeRound() {
    this.firstToFinishPlayerId = null
    this.selectedCardValue = null
    this.lastTurnStatus = LAST_TURN_STATUS.TURN
    this.initializeCardPiles()
    this.resetRoundPlayers()

    // Give to each player 12 cards
    this.givePlayersCards()

    // Turn first card from faceoff pile to discard pile
    this.discardPile.push(this.drawPile.shift()!)

    this.turnStatus = TURN_STATUS.CHOOSE_A_PILE

    if (this.settings.initialTurnedCount === 0)
      this.roundStatus = ROUND_STATUS.PLAYING
    else this.roundStatus = ROUND_STATUS.WAITING_PLAYERS_TO_TURN_INITIAL_CARDS
  }

  private reloadDrawPile() {
    const lastCardOfDiscardPile = this.discardPile.pop()!
    this.drawPile = shuffle(this.discardPile, SHUFFLE_ITERATIONS)
    this.discardPile = [lastCardOfDiscardPile]
  }

  private setFirstPlayerToStart() {
    const playersScore = this.players.map((player, i) => {
      if (player.connectionStatus === CONNECTION_STATUS.DISCONNECTED)
        return undefined

      const arrayScore = player.currentScoreArray()

      return {
        arrayScore,
        index: i,
      }
    })

    // the player with the highest score will start. If there is a tie, the player who have the highest card will start
    const playerToStart = playersScore.reduce((a, b) => {
      if (!a) return b
      if (!b) return a

      const aSum = a.arrayScore.reduce((acc, cur) => acc + cur, 0)
      const bSum = b.arrayScore.reduce((acc, cur) => acc + cur, 0)

      if (aSum === bSum) {
        const aMax = Math.max(...a.arrayScore)
        const bMax = Math.max(...b.arrayScore)

        return aMax > bMax ? a : b
      }

      return aSum > bSum ? a : b
    }, playersScore[0])

    this.turn = playerToStart!.index
  }

  private checkCardsToDiscard(player: SkyjoPlayer) {
    let cardsToDiscard: SkyjoCard[] = []

    if (this.settings.allowSkyjoForColumn) {
      cardsToDiscard = player.checkColumnsAndDiscard()
    }
    if (this.settings.allowSkyjoForRow) {
      cardsToDiscard = cardsToDiscard.concat(player.checkRowsAndDiscard())
    }

    if (cardsToDiscard.length > 0) {
      cardsToDiscard.forEach((card) => this.discardCard(card.value))

      if (this.settings.allowSkyjoForColumn && this.settings.allowSkyjoForRow)
        this.checkCardsToDiscard(player)
    }
  }

  private checkAndSetFirstPlayerToFinish(player: SkyjoPlayer) {
    // check if the player has turned all his cards
    const hasPlayerFinished = player.hasRevealedCardCount(
      player.cards.flat().length,
    )

    if (hasPlayerFinished && !this.firstToFinishPlayerId) {
      this.firstToFinishPlayerId = player.id
      this.roundStatus = ROUND_STATUS.LAST_LAP
    }
  }

  private getNextTurn() {
    let nextTurn = (this.turn + 1) % this.players.length

    while (
      this.players[nextTurn].connectionStatus === CONNECTION_STATUS.DISCONNECTED
    ) {
      nextTurn = (nextTurn + 1) % this.players.length
    }

    return nextTurn
  }

  private removeDisconnectedPlayers() {
    this.players = this.getConnectedPlayers()
  }

  private resetPlayers() {
    this.removeDisconnectedPlayers()

    this.getConnectedPlayers().forEach((player) => player.reset())
  }

  private multiplyScoreForFirstPlayer() {
    const lastScoreIndex = this.roundNumber - 1
    const firstToFinishPlayer = this.players.find(
      (player) => player.id === this.firstToFinishPlayerId,
    )

    const firstToFinishPlayerScore = firstToFinishPlayer!.scores[lastScoreIndex]

    if (
      typeof firstToFinishPlayerScore === "number" &&
      firstToFinishPlayerScore <= 0
    ) {
      return
    }

    const playersWithoutFirstPlayerToFinish = this.getConnectedPlayers().filter(
      (player) => player.id !== this.firstToFinishPlayerId,
    )

    const opponentWithALowerOrEqualScore =
      playersWithoutFirstPlayerToFinish.some(
        (player) =>
          player.scores[lastScoreIndex] <= firstToFinishPlayerScore &&
          player.scores[lastScoreIndex] !== "-",
      )

    if (opponentWithALowerOrEqualScore) {
      firstToFinishPlayer!.scores[lastScoreIndex] =
        +firstToFinishPlayer!.scores[lastScoreIndex] *
        this.settings.multiplierForFirstPlayer

      firstToFinishPlayer!.recalculateScore()
    }
  }

  private checkEndOfGame() {
    if (
      this.getConnectedPlayers().some(
        (player) => player.score >= this.settings.scoreToEndGame,
      )
    ) {
      this.roundStatus = ROUND_STATUS.OVER
      this.status = GAME_STATUS.FINISHED
    }
  }
  //#endregion
}
