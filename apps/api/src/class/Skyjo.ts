import { RoundState, SkyjoToJSON, TurnState } from "shared/types/Skyjo"
import { SkyjoCardToJSON } from "shared/types/SkyjoCard"
import { shuffle } from "../utils/shuffle"
import { Game, IGame } from "./Game"
import { SkyjoCard } from "./SkyjoCard"
import { SkyjoPlayer } from "./SkyjoPlayer"

interface ISkyjo extends IGame<SkyjoPlayer> {
  selectedCard: SkyjoCardToJSON | null
  firstPlayerToFinish: SkyjoPlayer | null
  turnState: TurnState
  resetCardPiles(): void
  givePlayersCards(player: SkyjoPlayer): void
  checkIfAllPlayersTurnedAmountOfCards(): void
  pickCardFromDrawPile(): void
  pickCardFromDiscardPile(): void
  putCardInDiscardPile(card: SkyjoCardToJSON): void
  checkRoundEnd(): void
  endGame(): void
  reset(): void

  toJSON(): SkyjoToJSON
}

export class Skyjo extends Game<SkyjoPlayer> implements ISkyjo {
  selectedCard: SkyjoCard | null = null
  turnState: TurnState = "chooseAPile"
  private _discardPile: number[] = []
  private _drawPile: number[] = []
  roundState: RoundState = "waitingPlayersToTurnTwoCards"
  roundNumber: number = 1
  firstPlayerToFinish: SkyjoPlayer | null = null

  constructor(privateGame: boolean = false) {
    super(2, privateGame)
  }

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

  public resetCardPiles() {
    const defaultCards = [
      ...Array(5).fill(-2),
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

    this.drawPile = shuffle(defaultCards, 3)
    this.discardPile = []
  }

  private reloadDrawPile() {
    const lastCardOfDiscardPile = this.discardPile.pop()!
    this.drawPile = shuffle(this.discardPile, 3)
    this.discardPile = [lastCardOfDiscardPile]
  }

  private resetPlayers() {
    this.players.forEach((player) => {
      player.reset()
    })
  }

  private setFirstPlayerToStart() {
    const playersScore = this.players.map((player, i) => {
      const arrayScore = player.currentScoreArray()

      return {
        arrayScore,
        index: i,
      }
    })

    // the player with the highest score will start. If there is a tie, the player who have the highest card will start
    const playerToStart = playersScore.reduce((a, b) => {
      const aSum = a.arrayScore.reduce((acc, cur) => acc + cur, 0)
      const bSum = b.arrayScore.reduce((acc, cur) => acc + cur, 0)

      if (aSum === bSum) {
        const aMax = Math.max(...a.arrayScore)
        const bMax = Math.max(...b.arrayScore)

        return aMax > bMax ? a : b
      }

      return aSum > bSum ? a : b
    })

    this.turn = playerToStart.index
  }

  public start() {
    this.reset()

    super.start()
  }

  public givePlayersCards() {
    this.players.forEach((player) => {
      const cards = this.drawPile.splice(0, 12)
      player.setCards(cards)
    })
  }

  public checkIfAllPlayersTurnedAmountOfCards() {
    const allPlayersTurnedCards = this.players.every((player) =>
      player.hasTurnedSpecifiedNumberOfCards(),
    )

    if (allPlayersTurnedCards) {
      this.roundState = "start"
      this.setFirstPlayerToStart()
    }
  }

  public pickCardFromDrawPile() {
    if (this.drawPile.length === 0) this.reloadDrawPile()

    const cardValue = this.drawPile.shift()!
    const card = new SkyjoCard(cardValue)
    card.turnVisible()
    this.selectedCard = card

    this.turnState = "throwOrReplace"
  }

  public pickCardFromDiscardPile() {
    if (this.discardPile.length === 0) return
    const cardValue = this.discardPile.pop()!
    const card = new SkyjoCard(cardValue)
    card.turnVisible()
    this.selectedCard = card

    this.turnState = "replaceACard"
  }

  public putCardInDiscardPile(card: SkyjoCard) {
    this.discardPile.push(card.value)
    this.selectedCard = null

    this.turnState = "turnACard"
  }

  public replaceCard(column: number, row: number) {
    const player = this.getCurrentPlayer()
    const oldCard = player.cards[column][row]
    const selectedCard = this.selectedCard
    this.putCardInDiscardPile(oldCard)
    player.replaceCard(column, row, selectedCard!)
  }

  override nextTurn() {
    this.turnState = "chooseAPile"
    super.nextTurn()
  }

  public checkRoundEnd() {
    const nextTurn = (this.turn + 1) % this.players.length

    if (this.players[nextTurn] === this.firstPlayerToFinish) {
      this.players.forEach((player) => {
        player.finalRoundScore()
      })

      this.checkFirstPlayerHasToDoubleScore()

      if (this.players.some((player) => player.score >= 100)) {
        this.endGame()
      } else {
        this.roundState = "over"
      }
    }
  }

  private checkFirstPlayerHasToDoubleScore() {
    const lastScoreIndex = this.roundNumber - 1
    const firstToFinishPlayerScore =
      this.firstPlayerToFinish!.scores[lastScoreIndex]

    const playersWithoutFirstPlayerToFinish = this.players.filter(
      (player) => player !== this.firstPlayerToFinish,
    )
    // Check if there is any player with a lower or equal score than the first player to finish
    const opponentWithALowerOrEqualScore =
      playersWithoutFirstPlayerToFinish.some(
        (obj) => obj.scores[lastScoreIndex] <= firstToFinishPlayerScore,
      )

    if (opponentWithALowerOrEqualScore) {
      this.firstPlayerToFinish!.scores[lastScoreIndex] *= 2
      this.firstPlayerToFinish!.recalculateScore()
    }
  }

  public newRound() {
    this.roundNumber++
    this.resetRound()
  }

  public resetRound() {
    this.firstPlayerToFinish = null
    this.selectedCard = null
    this.resetCardPiles()
    this.resetPlayers()

    // Give to each player 12 cards
    this.givePlayersCards()

    // Turn first card from faceoff pile to discard pile
    this.discardPile.push(this.drawPile.shift()!)

    this.turnState = "chooseAPile"
    this.roundState = "waitingPlayersToTurnTwoCards"
  }

  public reset() {
    this.roundNumber = 1
    this.firstPlayerToFinish = null
    this.selectedCard = null
    this.resetCardPiles()
    this.resetPlayers()

    // Give to each player 12 cards
    this.givePlayersCards()

    // Turn first card from faceoff pile to discard pile
    this.discardPile.push(this.drawPile.shift()!)

    this.turnState = "chooseAPile"
    this.roundState = "waitingPlayersToTurnTwoCards"
  }

  public checkEndGame() {
    if (this.players.some((player) => player.score >= 100)) {
      this.endGame()
    }
  }

  public endGame() {
    this.roundState = "over"
    this.status = "finished"
  }

  override toJSON() {
    return {
      ...super.toJSON(),
      players: this.players.map((player) => player.toJSON()),
      selectedCard: this.selectedCard?.toJSON(),
      lastDiscardCardValue: this.discardPile[this.discardPile.length - 1],
      roundState: this.roundState,
      turnState: this.turnState,
    }
  }
}
