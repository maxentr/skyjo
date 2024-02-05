import { SkyjoPlayerToJSON } from "shared/types/SkyjoPlayer"
import { IPlayer, Player } from "./Player"
import { SkyjoCard } from "./SkyjoCard"

//  Each player has 12 cards. 4 columns, 3 rows.
const CARDS_PER_ROW = 3
const CARDS_PER_COLUMN = 4
// Number of cards a player can turn at the beginning of the game
const INITIAL_TURNED_CARDS_COUNT = 2

interface ISkyjoPlayer extends IPlayer {
  cards: SkyjoCard[][]
  scores: number[]
  toJSON(): SkyjoPlayerToJSON
}
export class SkyjoPlayer extends Player implements ISkyjoPlayer {
  cards: SkyjoCard[][] = []
  scores: number[] = []

  public setCards(cardsValue: number[]) {
    this.cards = []

    for (let columnI = 0; columnI < CARDS_PER_COLUMN; columnI++) {
      this.cards.push([])
      for (let rowJ = 0; rowJ < CARDS_PER_ROW; rowJ++) {
        const index = columnI * CARDS_PER_ROW + rowJ
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

  public hasTurnedSpecifiedNumberOfCards() {
    let count = 0

    this.cards.forEach((column) => {
      column.forEach((card) => {
        if (card.isVisible) {
          count++
        }
      })
    })

    return count === INITIAL_TURNED_CARDS_COUNT
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

  public hasTurnedAllCards() {
    let count = 0

    this.cards.forEach((column) => {
      column.forEach((card) => {
        if (card.isVisible) {
          count++
        }
      })
    })

    return count === this.cards.length * CARDS_PER_ROW
  }

  public currentScore() {
    let currentScore = 0

    this.cards.forEach((column) => {
      column.forEach((card) => {
        if (card.isVisible) {
          currentScore += card.value
        }
      })
    })

    return currentScore
  }

  public currentScoreArray() {
    const currentScore: number[] = []

    this.cards.forEach((column) => {
      column.forEach((card) => {
        if (card.isVisible) {
          currentScore.push(card.value)
        }
      })
    })

    return currentScore
  }

  public finalRoundScore() {
    let finalScore = 0

    this.cards.forEach((column) => {
      column.forEach((card) => {
        finalScore += card.value
      })
    })

    this.scores.push(finalScore)

    this.score = this.scores.reduce((a, b) => a + b, 0)
  }

  public recalculateScore() {
    this.score = this.scores.reduce((a, b) => a + b, 0)
  }

  public reset() {
    this.cards = []
  }

  override toJSON() {
    const player = {
      ...super.toJSON(),
      scores: this.scores,
      currentScore: this.currentScore(),
      cards: this.cards.map((column) => column.map((card) => card.toJSON())),
    }

    return player
  }
}
