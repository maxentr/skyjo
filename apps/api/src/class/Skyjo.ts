import { Move, RoundState, SkyjoToJson, TurnState } from "shared/types/skyjo"
import { SkyjoCardToJson } from "shared/types/skyjoCard"
import { shuffle } from "../utils/shuffle"
import { Game, GameInterface } from "./Game"
import { SkyjoCard } from "./SkyjoCard"
import { SkyjoPlayer } from "./SkyjoPlayer"
import { SkyjoSettings } from "./SkyjoSettings"

const SHUFFLE_ITERATIONS = 3

interface SkyjoInterface extends GameInterface<SkyjoPlayer> {
  selectedCard: SkyjoCardToJson | null
  firstPlayerToFinish: SkyjoPlayer | null
  turnState: TurnState
  lastMove: Move

  initializeCardPiles(): void
  start(): void
  givePlayersCards(player: SkyjoPlayer): void
  checkAllPlayersRevealedCards(count: number): void
  drawCard(): void
  pickFromDiscard(): void
  discardCard(card: SkyjoCardToJson): void
  replaceCard(column: number, row: number): void
  turnCard(player: SkyjoPlayer, column: number, row: number): void
  nextTurn(): void
  checkIfPlayerFinished(player: SkyjoPlayer): boolean
  checkEndOfRound(): void
  reset(): void
  toJson(): SkyjoToJson
}

export class Skyjo
  extends Game<SkyjoPlayer, SkyjoSettings>
  implements SkyjoInterface
{
  private _discardPile: number[] = []
  private _drawPile: number[] = []

  selectedCard: SkyjoCard | null = null
  turnState: TurnState = "chooseAPile"
  lastMove: Move = "turn"
  roundState: RoundState = "waitingPlayersToTurnInitialCards"
  roundNumber: number = 1
  firstPlayerToFinish: SkyjoPlayer | null = null
  settings: SkyjoSettings = new SkyjoSettings()

  constructor(player: SkyjoPlayer, settings: SkyjoSettings) {
    super(player, settings)
  }

  initializeCardPiles() {
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

  start() {
    this.reset()
    this.lastMove = "turn"
    if (this.settings.initialTurnedCount === 0) this.roundState = "playing"

    super.start()
  }

  givePlayersCards() {
    this.getConnectedPlayers().forEach((player) => {
      const cards = this.drawPile.splice(0, 12)
      player.setCards(cards, this.settings)
    })
  }

  checkAllPlayersRevealedCards(count: number) {
    const allPlayersTurnedCards = this.getConnectedPlayers().every((player) =>
      player.hasRevealedCardCount(count),
    )

    if (allPlayersTurnedCards) {
      this.roundState = "playing"
      this.setFirstPlayerToStart()
    }
  }

  drawCard() {
    if (this.drawPile.length === 0) this.reloadDrawPile()

    const cardValue = this.drawPile.shift()!
    const card = new SkyjoCard(cardValue)
    card.turnVisible()
    this.selectedCard = card

    this.turnState = "throwOrReplace"
    this.lastMove = "pickFromDrawPile"
  }

  pickFromDiscard() {
    if (this.discardPile.length === 0) return
    const cardValue = this.discardPile.pop()!
    const card = new SkyjoCard(cardValue)
    card.turnVisible()
    this.selectedCard = card

    this.turnState = "replaceACard"
    this.lastMove = "pickFromDiscardPile"
  }

  discardCard(card: SkyjoCard) {
    this.discardPile.push(card.value)
    this.selectedCard = null

    this.turnState = "turnACard"
    this.lastMove = "throw"
  }

  replaceCard(column: number, row: number) {
    const player = this.getCurrentPlayer()
    const oldCard = player.cards[column][row]
    const selectedCard = this.selectedCard
    this.discardCard(oldCard)
    player.replaceCard(column, row, selectedCard!)
    this.lastMove = "replace"
  }

  turnCard(player: SkyjoPlayer, column: number, row: number) {
    player.turnCard(column, row)
    this.lastMove = "turn"
  }

  override nextTurn() {
    this.turnState = "chooseAPile"
    super.nextTurn()
  }

  checkIfPlayerFinished(player: SkyjoPlayer) {
    // check if the player has turned all his cards
    const hasPlayerFinished = player.hasRevealedCardCount(
      player.cards.flat().length,
    )

    if (hasPlayerFinished && !this.firstPlayerToFinish) {
      this.firstPlayerToFinish = player
      this.roundState = "lastLap"

      return true
    }

    return false
  }

  checkEndOfRound() {
    const connectedPlayers = this.getConnectedPlayers()
    const nextTurn = this.getNextTurn()

    if (connectedPlayers[nextTurn] === this.firstPlayerToFinish) {
      this.players.forEach((player) => {
        player.turnAllCards()
        player.checkColumnsAndDiscard()
        player.finalRoundScore()
      })

      this.doubleScoreForFirstPlayer()

      this.roundState = "over"
    }
  }

  startNewRound() {
    this.roundNumber++
    this.initializeRound()
  }

  checkEndGame() {
    if (this.getConnectedPlayers().some((player) => player.score >= 100)) {
      this.endGame()
    }
  }

  reset() {
    this.roundNumber = 1
    this.resetPlayers()
    this.initializeRound()
  }

  override toJson() {
    return {
      ...super.toJson(),
      admin: this.admin.toJson(),
      players: this.players.map((player) => player.toJson()),
      selectedCard: this.selectedCard?.toJson(),
      lastDiscardCardValue: this.discardPile[this.discardPile.length - 1],
      roundState: this.roundState,
      turnState: this.turnState,
      lastMove: this.lastMove,
      settings: this.settings.toJson(),
    }
  }

  //#region private methods
  private get discardPile() {
    return this._discardPile
  }
  private set discardPile(value: number[]) {
    this._discardPile = value
  }

  private get drawPile() {
    return this._drawPile
  }
  private set drawPile(value: number[]) {
    this._drawPile = value
  }

  private reloadDrawPile() {
    const lastCardOfDiscardPile = this.discardPile.pop()!
    this.drawPile = shuffle(this.discardPile, SHUFFLE_ITERATIONS)
    this.discardPile = [lastCardOfDiscardPile]
  }

  private setFirstPlayerToStart() {
    const playersScore = this.players.map((player, i) => {
      if (player.connectionStatus === "disconnected") return undefined

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

  private removeDisconnectedPlayers() {
    this.players = this.getConnectedPlayers()
  }

  private resetPlayers() {
    this.removeDisconnectedPlayers()

    this.getConnectedPlayers().forEach((player) => player.reset())
  }

  private resetRoundPlayers() {
    this.getConnectedPlayers().forEach((player) => {
      player.resetRound()
    })
  }

  private doubleScoreForFirstPlayer() {
    const lastScoreIndex = this.roundNumber - 1
    const firstToFinishPlayerScore =
      this.firstPlayerToFinish!.scores[lastScoreIndex]

    const playersWithoutFirstPlayerToFinish = this.getConnectedPlayers().filter(
      (player) => player !== this.firstPlayerToFinish,
    )

    const opponentWithALowerOrEqualScore =
      playersWithoutFirstPlayerToFinish.some(
        (player) =>
          player.scores[lastScoreIndex] <= firstToFinishPlayerScore &&
          player.scores[lastScoreIndex] !== "-",
      )

    if (opponentWithALowerOrEqualScore) {
      this.firstPlayerToFinish!.scores[lastScoreIndex] =
        +this.firstPlayerToFinish!.scores[lastScoreIndex] * 2
      this.firstPlayerToFinish!.recalculateScore()
    }
  }

  private initializeRound() {
    this.firstPlayerToFinish = null
    this.selectedCard = null
    this.lastMove = "turn"
    this.initializeCardPiles()
    this.resetRoundPlayers()

    // Give to each player 12 cards
    this.givePlayersCards()

    // Turn first card from faceoff pile to discard pile
    this.discardPile.push(this.drawPile.shift()!)

    this.turnState = "chooseAPile"

    if (this.settings.initialTurnedCount === 0) this.roundState = "playing"
    else this.roundState = "waitingPlayersToTurnInitialCards"
  }

  private endGame() {
    this.roundState = "over"
    this.status = "finished"
  }
  //#endregion
}
