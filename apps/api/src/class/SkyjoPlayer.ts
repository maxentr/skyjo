import { SkyjoPlayerScores, SkyjoPlayerToJson } from "shared/types/skyjoPlayer"
import { Player, PlayerInterface } from "./Player"
import { SkyjoCard } from "./SkyjoCard"
import { SkyjoSettings } from "./SkyjoSettings"

interface SkyjoPlayerInterface extends PlayerInterface {
  cards: SkyjoCard[][]
  scores: SkyjoPlayerScores
  toJson(): SkyjoPlayerToJson
}
export class SkyjoPlayer extends Player implements SkyjoPlayerInterface {
  cards: SkyjoCard[][] = []
  scores: SkyjoPlayerScores = []

  setCards(cardsValue: number[], cardSettings: SkyjoSettings) {
    this.cards = []

    for (let columnI = 0; columnI < cardSettings.cardPerColumn; columnI++) {
      this.cards.push([])
      for (let rowJ = 0; rowJ < cardSettings.cardPerRow; rowJ++) {
        const index = columnI * cardSettings.cardPerRow + rowJ
        this.cards[columnI].push(new SkyjoCard(cardsValue[index]))
      }
    }
  }

  turnCard(column: number, row: number) {
    this.cards[column][row].turnVisible()
  }

  replaceCard(column: number, row: number, card: SkyjoCard) {
    this.cards[column][row] = card
  }

  removeColumn(column: number) {
    const deletedColumn = this.cards.splice(column, 1)
    return deletedColumn[0]
  }

  removeRow(row: number) {
    const deletedRow = this.cards.map((column) => column.splice(row, 1))
    return deletedRow.flat()
  }

  hasRevealedCardCount(count: number) {
    const currentCount = this.cards
      .flat()
      .filter((card) => card.isVisible).length

    return currentCount === count
  }

  checkColumnsAndDiscard() {
    if (!this.cards[0] || this.cards[0].length <= 1) return []

    const cardsToDiscard: SkyjoCard[] = []
    this.cards.forEach((column, index) => {
      const allCardsAreTheSameAndVisible = column.every(
        (card) => card.value === column[0].value && card.isVisible,
      )

      if (allCardsAreTheSameAndVisible) {
        cardsToDiscard.push(...this.removeColumn(index))
      }
    })

    return cardsToDiscard
  }

  checkRowsAndDiscard() {
    if (this.cards.length <= 1) return []

    const cardsToDiscard: SkyjoCard[] = []

    for (let rowIndex = 0; rowIndex < this.cards[0].length; rowIndex++) {
      const row = this.cards
        .map((column) => column.slice(rowIndex, rowIndex + 1))
        .flat()

      const allCardsAreTheSameAndVisible = row.every(
        (card) => card.value === row[0].value && card.isVisible,
      )

      if (allCardsAreTheSameAndVisible) {
        cardsToDiscard.push(...this.removeRow(rowIndex))
      }
    }

    return cardsToDiscard
  }

  currentScoreArray() {
    const currentScore: number[] = []

    this.cards.flat().forEach((card) => {
      if (card.isVisible) currentScore.push(card.value)
    })

    return currentScore
  }

  currentScore() {
    return this.currentScoreArray().reduce((a, b) => a + b, 0)
  }

  turnAllCards() {
    this.cards.forEach((column) => {
      column.forEach((card) => {
        card.turnVisible()
      })
    })
  }

  recalculateScore() {
    this.score = (
      this.scores.filter((score) => Number.isInteger(score)) as number[]
    ).reduce((a, b) => +a + +b, 0)
  }

  finalRoundScore() {
    let finalScore = 0

    if (this.connectionStatus === "disconnected") {
      this.scores.push("-")
      return
    }

    this.cards.forEach((column) => {
      column.forEach((card) => {
        finalScore += card.value
      })
    })

    this.scores.push(finalScore)

    this.recalculateScore()
  }

  reset() {
    this.cards = []
    this.wantReplay = false
    this.scores = []
    this.score = 0
  }

  resetRound() {
    this.cards = []
  }

  override toJson() {
    const player = {
      ...super.toJson(),
      scores: this.scores,
      currentScore: this.currentScore(),
      cards: this.cards.map((column) => column.map((card) => card.toJson())),
    }

    return player
  }
}
