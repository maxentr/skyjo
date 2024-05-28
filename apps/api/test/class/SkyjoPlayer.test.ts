import { SkyjoCard } from "@/class/SkyjoCard"
import { SkyjoPlayer } from "@/class/SkyjoPlayer"
import { SkyjoSettings } from "@/class/SkyjoSettings"
import { beforeEach, describe, expect, it } from "vitest"

let nbColumns: number
let nbRows: number

const cardPerColumn = 3
const cardPerRow = 4

describe("SkyjoPlayer", () => {
  let player: SkyjoPlayer

  beforeEach(() => {
    player = new SkyjoPlayer("username", "socketID123", "bee")
    player.cards = [
      [new SkyjoCard(0), new SkyjoCard(0), new SkyjoCard(0)],
      [new SkyjoCard(0), new SkyjoCard(4), new SkyjoCard(6)],
      [new SkyjoCard(0), new SkyjoCard(7), new SkyjoCard(3)],
      [new SkyjoCard(0), new SkyjoCard(-1), new SkyjoCard(11)],
    ]

    nbColumns = player.cards.length
    nbRows = player.cards[0].length
  })

  describe("set cards", () => {
    it("should set cards with default settings", () => {
      player.setCards(
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        new SkyjoSettings(),
      )

      expect(player.cards).toStrictEqual([
        [new SkyjoCard(1), new SkyjoCard(2), new SkyjoCard(3)],
        [new SkyjoCard(4), new SkyjoCard(5), new SkyjoCard(6)],
        [new SkyjoCard(7), new SkyjoCard(8), new SkyjoCard(9)],
        [new SkyjoCard(10), new SkyjoCard(11), new SkyjoCard(12)],
      ])
    })

    it("should set cards with custom settings", () => {
      const settings = new SkyjoSettings()
      settings.cardPerRow = 2
      settings.cardPerColumn = 2
      player.setCards([1, 2, 3, 4], settings)

      expect(player.cards).toStrictEqual([
        [new SkyjoCard(1), new SkyjoCard(2)],
        [new SkyjoCard(3), new SkyjoCard(4)],
      ])
    })
  })

  it("should turn a card", () => {
    expect(player.cards[0][0].isVisible).toBeFalsy()

    player.turnCard(0, 0)

    expect(player.cards[0][0].isVisible).toBeTruthy()
  })

  it("should replace a card", () => {
    expect(player.cards[0][0].value).toBe(0)

    player.replaceCard(0, 0, new SkyjoCard(12))

    expect(player.cards[0][0].value).toBe(12)
  })

  it("should remove a column", () => {
    const columnIndex = 1
    const cards = deepCloneArray(player.cards)

    const column = player.removeColumn(columnIndex)

    expect(player.cards).toStrictEqual(
      cards.filter((_, index) => index !== columnIndex),
    )
    expect(column).toStrictEqual(cards[columnIndex])
  })

  it("should remove a row", () => {
    const rowIndex = 1

    const cards = deepCloneArray(player.cards)

    const row = player.removeRow(rowIndex)

    expect(player.cards).toStrictEqual(
      cards.map((column) => column.filter((_, index) => index !== rowIndex)),
    )
    expect(row).toStrictEqual(cards.map((column) => column[rowIndex]))
  })

  describe("has revealed card count", () => {
    it("should return false if the count is different", () => {
      expect(player.hasRevealedCardCount(2)).toBe(false)

      player.turnCard(0, 0)

      expect(player.hasRevealedCardCount(2)).toBe(false)
    })

    it("should return true if the count is the same", () => {
      player.turnCard(0, 0)
      player.turnCard(0, 1)

      expect(player.hasRevealedCardCount(2)).toBe(true)
    })
  })

  describe("check columns and discard", () => {
    it("should remove a column if cards visible and all cards are the same", () => {
      player.turnAllCards()

      const cards = player.checkColumnsAndDiscard()

      expect(cards.length).toBe(cardPerColumn)
      expect(player.cards.length).toBe(nbColumns - 1)
    })

    it("should not remove a column if cards are not visible", () => {
      const cards = player.checkColumnsAndDiscard()

      expect(cards.length).toBe(0)
      expect(player.cards.length).toBe(nbColumns)
    })

    it("should not remove a column if cards are visible but different", () => {
      player.cards = [
        [new SkyjoCard(2, true), new SkyjoCard(1, true)],
        [new SkyjoCard(3), new SkyjoCard(2)],
        [new SkyjoCard(3), new SkyjoCard(1)],
        [new SkyjoCard(3), new SkyjoCard(1)],
      ]
      const cards = player.checkColumnsAndDiscard()

      expect(cards.length).toBe(0)
      expect(player.cards.length).toBe(nbColumns)
    })

    it("should not remove a column if there is only one row", () => {
      player.cards = [
        [new SkyjoCard(1)],
        [new SkyjoCard(2)],
        [new SkyjoCard(3)],
        [new SkyjoCard(4)],
      ]

      const cards = player.checkColumnsAndDiscard()

      expect(cards.length).toBe(0)
      expect(player.cards.length).toBe(nbColumns)
    })
  })

  describe("check rows and discard", () => {
    it("should remove a row if cards visible and all cards are the same", () => {
      player.turnAllCards()

      const cardsToDiscard = player.checkRowsAndDiscard()

      expect(cardsToDiscard.length).toBe(cardPerRow)

      for (const column of player.cards) {
        expect(column.length).toBe(nbRows - 1)
      }
    })

    it("should not remove a row if cards are not visible", () => {
      const cardsToDiscard = player.checkRowsAndDiscard()

      expect(cardsToDiscard.length).toBe(0)

      for (const column of player.cards) {
        expect(column.length).toBe(nbRows)
      }
    })

    it("should not remove a row if cards are visible but different", () => {
      player.cards = [
        [new SkyjoCard(1, true), new SkyjoCard(2)],
        [new SkyjoCard(3, true), new SkyjoCard(2)],
        [new SkyjoCard(3, true), new SkyjoCard(1)],
        [new SkyjoCard(3, true), new SkyjoCard(1)],
      ]
      const cards = player.checkRowsAndDiscard()

      expect(cards.length).toBe(0)
      expect(player.cards.length).toBe(nbColumns)
    })

    it("should not remove a row if there is only one column", () => {
      player.cards = [[new SkyjoCard(1, true), new SkyjoCard(1, true)]]

      const cards = player.checkRowsAndDiscard()

      expect(cards.length).toBe(0)
      expect(player.cards.length).toBe(1)
    })
  })

  describe("current score array", () => {
    it("should return an empty array as current score in an array if no cards are revealed", () => {
      expect(player.currentScoreArray()).toStrictEqual([])
    })

    it("should return the current score in an array", () => {
      expect(player.currentScoreArray()).toStrictEqual([])

      player.turnCard(0, 0)

      expect(player.currentScoreArray()).toStrictEqual([0])

      player.turnAllCards()

      expect(player.currentScoreArray()).toStrictEqual([
        0, 0, 0, 0, 4, 6, 0, 7, 3, 0, -1, 11,
      ])
    })

    it("should return the current score array", () => {
      expect(player.currentScore()).toBe(0)
    })
    it("should remove a row that doesn't exist", () => {
      const rowIndex = 3

      const cards = player.cards.map((row) => {
        return row.slice()
      })

      const row = player.removeRow(rowIndex)

      expect(player.cards).toStrictEqual(cards)
      expect(row).toStrictEqual([])
    })
  })

  it("should get current score", () => {
    expect(player.currentScore()).toBe(0)

    player.turnCard(0, 0)

    expect(player.currentScore()).toBe(0)

    player.turnAllCards()

    expect(player.currentScore()).toBe(30)
  })

  it("should turn all cards", () => {
    for (const column of player.cards) {
      for (const card of column) {
        expect(card.isVisible).toBeFalsy()
      }
    }

    player.turnAllCards()

    for (const column of player.cards) {
      for (const card of column) {
        expect(card.isVisible).toBeTruthy()
      }
    }
  })

  it("should recalculate the score", () => {
    player.scores = []
    player.recalculateScore()

    expect(player.score).toBe(0)

    player.scores = [10, 20]
    player.recalculateScore()

    expect(player.score).toBe(30)
  })

  describe("final round score", () => {
    it("should calculate the final round score", () => {
      player.finalRoundScore()

      expect(player.scores).toStrictEqual([30])
      expect(player.score).toBe(30)
    })

    it("should calculate the final round score when disconnected", () => {
      player.connectionStatus = "disconnected"

      player.finalRoundScore()

      expect(player.scores).toStrictEqual(["-"])
      expect(player.score).toBe(0)
    })
  })

  it("should reset the player", () => {
    player.scores = [10, 20]
    player.score = 30
    player.wantReplay = true
    player.reset()

    expect(player.cards).toStrictEqual([])
    expect(player.wantReplay).toBeFalsy()
    expect(player.scores).toStrictEqual([])
    expect(player.score).toBe(0)
  })

  it("should reset the round game data", () => {
    player.scores = [10, 20]
    player.turnAllCards()
    player.finalRoundScore()

    player.resetRound()

    expect(player.scores).toStrictEqual([10, 20, 30])
    expect(player.score).toBe(60)
    expect(player.cards).toStrictEqual([])
  })

  it("should return json", () => {
    const playerToJson = player.toJson()

    expect(playerToJson).toStrictEqual({
      name: "username",
      socketId: "socketID123",
      avatar: "bee",
      cards: player.cards.map((column) => column.map((card) => card.toJson())),
      currentScore: 0,
      score: 0,
      scores: [],
      wantReplay: false,
      connectionStatus: "connected",
    })
  })

  //#region function helpers
  function deepCloneArray<T extends any[][]>(array: T) {
    return array.map((row) => {
      return row.map((card) => {
        return new SkyjoCard(card.value, card.isVisible)
      })
    })
  }
  //#endregion
})
