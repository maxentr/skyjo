import { SkyjoPlayerToJson } from "shared/types/skyjoPlayer"
import { CardConstants } from "../constants"
import { Player, PlayerInterface } from "./Player"
import { SkyjoCard } from "./SkyjoCard"

interface SkyjoPlayerInterface extends PlayerInterface {
  cards: SkyjoCard[][]
  scores: number[]
  toJson(): SkyjoPlayerToJson
}
export class SkyjoPlayer extends Player implements SkyjoPlayerInterface {
  cards: SkyjoCard[][] = []
  scores: number[] = []

  public setCards(cardsValue: number[]) {
    this.cards = []

    for (let columnI = 0; columnI < CardConstants.PER_COLUMN; columnI++) {
      this.cards.push([])
      for (let rowJ = 0; rowJ < CardConstants.PER_ROW; rowJ++) {
        const index = columnI * CardConstants.PER_ROW + rowJ
        this.cards[columnI].push(new SkyjoCard(cardsValue[index]))
      }
    }
  }

  public turnCard(column: number, row: number) {
    this.cards[column][row].turnVisible()
  }

  public replaceCard(column: number, row: number, card: SkyjoCard) {
    this.cards[column][row] = card
  }

  public removeColumn(column: number) {
    const deletedColumn = this.cards.splice(column, 1)
    return deletedColumn[0]
  }

  public hasRevealedCardCount(count: number) {
    const currentCount = this.cards
      .flat()
      .filter((card) => card.isVisible).length

    return currentCount === count
  }

  public checkColumns() {
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

  public currentScoreArray() {
    const currentScore: number[] = []

    this.cards.flat().forEach((card) => {
      if (card.isVisible) currentScore.push(card.value)
    })

    return currentScore
  }

  public currentScore() {
    return this.currentScoreArray().reduce((a, b) => a + b, 0)
  }

  public finalRoundScore() {
    let finalScore = 0

    this.cards.forEach((column) => {
      column.forEach((card) => {
        card.turnVisible()
        finalScore += card.value
      })
    })

    this.scores.push(finalScore)

    this.recalculateScore()
  }

  public recalculateScore() {
    this.score = this.scores.reduce((a, b) => a + b, 0)
  }

  public reset() {
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
