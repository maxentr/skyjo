import { Skyjo } from "@/class/Skyjo"
import { SkyjoCard } from "@/class/SkyjoCard"
import { SkyjoPlayer } from "@/class/SkyjoPlayer"
import { SkyjoSettings } from "@/class/SkyjoSettings"
import { GameStatus } from "shared/types/game"
import { Move, RoundState, TurnState } from "shared/types/skyjo"
import { beforeEach, describe, expect, it } from "vitest"

const TOTAL_CARDS = 150
const CARDS_PER_PLAYER = 12

describe("Skyjo", () => {
  let skyjo: Skyjo
  let player: SkyjoPlayer
  let settings: SkyjoSettings
  let opponent: SkyjoPlayer

  beforeEach(() => {
    player = new SkyjoPlayer("player1", "socketId123", "bee")
    settings = new SkyjoSettings()
    skyjo = new Skyjo(player, settings)
    skyjo.addPlayer(player)

    opponent = new SkyjoPlayer("player2", "socketId123", "elephant")
    skyjo.addPlayer(opponent)
  })

  describe("start", () => {
    it("should start the game with default settings", () => {
      skyjo.start()

      expect(skyjo.status).toBe<GameStatus>("playing")
      expect(skyjo.roundState).toBe<RoundState>(
        "waitingPlayersToTurnInitialCards",
      )
    })

    it("should start the game and set the round status to playing if there is no card to turn at the beginning of the game", () => {
      skyjo.settings.initialTurnedCount = 0
      skyjo.start()

      expect(skyjo.status).toBe<GameStatus>("playing")
      expect(skyjo.roundState).toBe<RoundState>("playing")
    })
  })

  // describe("give players cards", () => {
  // it("should give players cards", () => {
  //   skyjo.initializeCardPiles()
  //   skyjo["givePlayersCards"]()

  //   expect(skyjo["drawPile"]).toHaveLength(TOTAL_CARDS - CARDS_PER_PLAYER * 2)
  //   skyjo.players.forEach((player) => {
  //     expect(player.cards.flat()).toHaveLength(CARDS_PER_PLAYER)
  //   })
  // })
  // })

  describe("check all players revealed cards", () => {
    it("should check all players revealed cards and not start the game", () => {
      skyjo.checkAllPlayersRevealedCards(skyjo.settings.initialTurnedCount)
      expect(skyjo.roundState).toBe<RoundState>(
        "waitingPlayersToTurnInitialCards",
      )
    })

    it("should check all players revealed cards, start the game and make the player with the highest current score start", () => {
      skyjo.start()
      // player 1 has 10 and player 2 has 9 for the second card
      skyjo.players.forEach((player, i) => {
        player.cards[0][0] = new SkyjoCard(10, true)
        player.cards[0][1] = new SkyjoCard(1 - i, true)
      })

      skyjo.checkAllPlayersRevealedCards(skyjo.settings.initialTurnedCount)

      expect(skyjo.roundState).toBe<RoundState>("playing")
      expect(skyjo.turn).toBe(0)
    })

    it("should check all players revealed cards, start the game and make the player with the highest card start when two players have the same current score", () => {
      skyjo.start()

      skyjo.players[0].cards[0][0] = new SkyjoCard(10, true)
      skyjo.players[0].cards[0][1] = new SkyjoCard(10, true)

      skyjo.players[1].cards[0][0] = new SkyjoCard(9, true)
      skyjo.players[1].cards[0][1] = new SkyjoCard(11, true)

      skyjo.checkAllPlayersRevealedCards(skyjo.settings.initialTurnedCount)

      expect(skyjo.roundState).toBe<RoundState>("playing")
      expect(skyjo.turn).toBe(1)
    })

    it("should check all players revealed cards, start the game and make the player with the highest card start while ignoring players who are not connected", () => {
      const opponent2 = new SkyjoPlayer("player3", "socketId123", "elephant")
      skyjo.addPlayer(opponent2)

      const opponent3 = new SkyjoPlayer("player4", "socketId123", "elephant")
      skyjo.addPlayer(opponent3)

      skyjo.start()

      skyjo.players[0].connectionStatus = "disconnected"
      skyjo.players[0].cards[0][0] = new SkyjoCard(10, true)
      skyjo.players[0].cards[0][1] = new SkyjoCard(10, true)

      skyjo.players[1].cards[0][0] = new SkyjoCard(12, true)
      skyjo.players[1].cards[0][1] = new SkyjoCard(12, true)

      skyjo.players[2].connectionStatus = "disconnected"
      skyjo.players[2].cards[0][0] = new SkyjoCard(9, true)
      skyjo.players[2].cards[0][1] = new SkyjoCard(11, true)

      skyjo.players[3].cards[0][0] = new SkyjoCard(9, true)
      skyjo.players[3].cards[0][1] = new SkyjoCard(12, true)

      skyjo.checkAllPlayersRevealedCards(skyjo.settings.initialTurnedCount)

      expect(skyjo.roundState).toBe<RoundState>("playing")
      expect(skyjo.turn).toBe(1)
    })
  })

  describe("draw card", () => {
    it("should draw card", () => {
      skyjo.start()

      expect(skyjo.selectedCard).toBeNull()
      expect(skyjo.turnState).toBe<TurnState>("chooseAPile")

      skyjo.drawCard()

      expect(skyjo.selectedCard).toBeInstanceOf(SkyjoCard)
      expect(skyjo.turnState).toBe<TurnState>("throwOrReplace")
      expect(skyjo.lastMove).toBe<Move>("pickFromDrawPile")
    })

    it("should draw card and reload the draw pile", () => {
      skyjo.start()

      skyjo["discardPile"] = [...skyjo["drawPile"], ...skyjo["discardPile"]]
      skyjo["drawPile"] = []

      const nbCardsUsedByPlayers = skyjo.players.length * CARDS_PER_PLAYER

      expect(skyjo.selectedCard).toBeNull()
      expect(skyjo.turnState).toBe<TurnState>("chooseAPile")
      expect(skyjo["drawPile"]).toHaveLength(0)
      expect(skyjo["discardPile"]).toHaveLength(
        TOTAL_CARDS - nbCardsUsedByPlayers,
      )

      skyjo.drawCard()

      expect(skyjo.selectedCard).toBeInstanceOf(SkyjoCard)
      expect(skyjo.turnState).toBe<TurnState>("throwOrReplace")
      expect(skyjo.lastMove).toBe<Move>("pickFromDrawPile")
      // 150(total cards) - 2(nb player) * 12(cards per player) - 1(draw pile) - 1(discard pile)
      expect(skyjo["drawPile"]).toHaveLength(
        TOTAL_CARDS - nbCardsUsedByPlayers - 1 - 1,
      )
      expect(skyjo["discardPile"]).toHaveLength(1)
    })
  })

  describe("pick from discard pile", () => {
    it("should pick a card from the discard pile", () => {
      skyjo.start()
      skyjo["discardPile"].push(skyjo["drawPile"].splice(0, 1)[0])

      expect(skyjo.selectedCard).toBeNull()
      expect(skyjo.turnState).toBe<TurnState>("chooseAPile")

      skyjo.pickFromDiscard()

      expect(skyjo.selectedCard).toBeInstanceOf(SkyjoCard)
      expect(skyjo.turnState).toBe<TurnState>("replaceACard")
      expect(skyjo.lastMove).toBe<Move>("pickFromDiscardPile")
    })

    it("should not pick a card from the discard pile if it's empty", () => {
      skyjo.start()
      skyjo["discardPile"] = []

      expect(skyjo.selectedCard).toBeNull()
      expect(skyjo.turnState).toBe<TurnState>("chooseAPile")

      skyjo.pickFromDiscard()

      expect(skyjo.selectedCard).toBeNull()
      expect(skyjo.turnState).toBe<TurnState>("chooseAPile")
    })
  })

  it("should discard card", () => {
    skyjo.discardCard(new SkyjoCard(10))

    expect(skyjo.selectedCard).toBeNull()
    expect(skyjo["discardPile"]).toHaveLength(1)
    expect(skyjo.turnState).toBe<TurnState>("turnACard")
    expect(skyjo.lastMove).toBe<Move>("throw")
  })

  it("should replace a card", () => {
    skyjo.start()

    const oldCard = player.cards[0][0]
    const selectedCard = new SkyjoCard(10, true)
    skyjo.turn = 0
    skyjo.selectedCard = selectedCard

    expect(player.cards[0][0]).toBe(oldCard)

    skyjo.replaceCard(0, 0)

    expect(player.cards[0][0]).toBe(selectedCard)
    expect(skyjo["discardPile"]).include(oldCard.value)
    expect(skyjo.selectedCard).toBeNull()
    expect(player.cards[0][0].isVisible).toBeTruthy()
    expect(skyjo.lastMove).toBe<Move>("replace")
  })

  it("should turn card", () => {
    skyjo.start()
    const card = player.cards[0][0]
    expect(card.isVisible).toBeFalsy()

    skyjo.turnCard(player, 0, 0)

    expect(card.isVisible).toBeTruthy()
    expect(skyjo.lastMove).toBe<Move>("turn")
  })

  describe("next turn", () => {
    it("should set next turn", () => {
      const currentTurn = skyjo.turn
      skyjo.nextTurn()

      expect(skyjo.turn).not.toBe(currentTurn)
      expect(skyjo.turnState).toBe<TurnState>("chooseAPile")
    })

    it("should set next turn and handle disconnected players", () => {
      const opponent2 = new SkyjoPlayer("player3", "socketId123", "elephant")
      opponent2.connectionStatus = "disconnected"
      skyjo.addPlayer(opponent2)
      skyjo.turn = 1

      skyjo.nextTurn()

      expect(skyjo.turn).toBe(0)
      expect(skyjo.turnState).toBe<TurnState>("chooseAPile")
    })

    it("should set next turn and discard a column and not discard a row", () => {
      skyjo.settings.allowSkyjoForRow = false
      skyjo.settings.allowSkyjoForColumn = true
      skyjo.start()
      skyjo.turn = 0
      player.cards = [
        [
          new SkyjoCard(1, true),
          new SkyjoCard(1, true),
          new SkyjoCard(1, true),
        ],
        [
          new SkyjoCard(1, true),
          new SkyjoCard(3, true),
          new SkyjoCard(3, true),
        ],
        [
          new SkyjoCard(1, true),
          new SkyjoCard(3, true),
          new SkyjoCard(3, true),
        ],
        [
          new SkyjoCard(1, true),
          new SkyjoCard(3, true),
          new SkyjoCard(3, true),
        ],
      ]

      skyjo.nextTurn()

      expect(player.cards.length).toBe(3)
      player.cards.forEach((column) => {
        expect(column.length).toBe(3)
      })
    })

    it("should set next turn and discard a row but not discard a column", () => {
      skyjo.settings.allowSkyjoForRow = true
      skyjo.settings.allowSkyjoForColumn = false
      skyjo.start()
      skyjo.turn = 0
      player.cards = [
        [
          new SkyjoCard(1, true),
          new SkyjoCard(1, true),
          new SkyjoCard(1, true),
        ],
        [
          new SkyjoCard(1, true),
          new SkyjoCard(3, true),
          new SkyjoCard(3, true),
        ],
        [
          new SkyjoCard(1, true),
          new SkyjoCard(3, true),
          new SkyjoCard(3, true),
        ],
        [
          new SkyjoCard(1, true),
          new SkyjoCard(3, true),
          new SkyjoCard(3, true),
        ],
      ]

      skyjo.nextTurn()

      expect(player.cards.length).toBe(4)
      player.cards.forEach((column) => {
        expect(column.length).toBe(2)
      })
    })

    it("should set next turn and discard a column and a row", () => {
      skyjo.settings.allowSkyjoForRow = true
      skyjo.settings.allowSkyjoForColumn = true
      skyjo.start()
      skyjo.turn = 0
      player.cards = [
        [
          new SkyjoCard(1, true),
          new SkyjoCard(1, true),
          new SkyjoCard(1, true),
        ],
        [
          new SkyjoCard(1, true),
          new SkyjoCard(2, true),
          new SkyjoCard(2, true),
        ],
        [
          new SkyjoCard(1, true),
          new SkyjoCard(6, true),
          new SkyjoCard(7, true),
        ],
        [
          new SkyjoCard(1, true),
          new SkyjoCard(9, true),
          new SkyjoCard(10, true),
        ],
      ]

      skyjo.nextTurn()

      expect(player.cards.length).toBe(3)
      player.cards.forEach((column) => {
        expect(column.length).toBe(2)
      })
    })

    it("should set next turn and set the first player to finish", () => {
      skyjo.settings.allowSkyjoForRow = true
      skyjo.start()
      skyjo.turn = 0
      player.cards = [
        [
          new SkyjoCard(1, true),
          new SkyjoCard(1, true),
          new SkyjoCard(1, true),
        ],
      ]

      skyjo.nextTurn()

      expect(skyjo.firstPlayerToFinish).toBe(player)
      expect(skyjo.status).toBe<GameStatus>("playing")
      expect(skyjo.roundState).toBe<RoundState>("lastLap")
    })

    it("should set next turn, check end round not end it, check end of game and not end it", () => {
      skyjo.start()
      skyjo.roundState = "playing"
      skyjo.firstPlayerToFinish = player
      skyjo.turn = 0

      skyjo.nextTurn()

      expect(skyjo.roundState).toBe<RoundState>("playing")
      expect(skyjo.status).toBe<GameStatus>("playing")
    })

    it("should set next turn, check end round, end it and not double score of the first player", () => {
      skyjo.start()
      skyjo.firstPlayerToFinish = player
      skyjo.turn = 1

      player.cards = [
        [
          new SkyjoCard(1, true),
          new SkyjoCard(1, true),
          new SkyjoCard(3, true),
        ],
      ]
      opponent.cards = [
        [
          new SkyjoCard(1, true),
          new SkyjoCard(1, true),
          new SkyjoCard(4, true),
        ],
      ]

      skyjo.nextTurn()

      expect(skyjo.roundState).toBe<RoundState>("over")
      expect(skyjo.status).toBe<GameStatus>("playing")
      expect(player.score).toBe(1 + 1 + 3)
    })

    it("should set next turn, check end round, end it and double score of the first player", () => {
      skyjo.start()
      skyjo.firstPlayerToFinish = player
      skyjo.turn = 1

      player.cards = [
        [
          new SkyjoCard(1, true),
          new SkyjoCard(1, true),
          new SkyjoCard(3, true),
        ],
      ]
      opponent.cards = [
        [
          new SkyjoCard(1, true),
          new SkyjoCard(1, true),
          new SkyjoCard(2, true),
        ],
      ]

      skyjo.nextTurn()

      expect(skyjo.roundState).toBe<RoundState>("over")
      expect(skyjo.status).toBe<GameStatus>("playing")
      expect(player.score).toBe((1 + 1 + 3) * 2)
    })

    it("should set next turn, check end round, end it and double score of the first player", () => {
      skyjo.start()
      skyjo.roundNumber = 2
      skyjo.firstPlayerToFinish = player
      skyjo.turn = 1

      player.scores = [90]
      player.cards = [
        [
          new SkyjoCard(1, true),
          new SkyjoCard(1, true),
          new SkyjoCard(3, true),
        ],
      ]

      opponent.scores = [45]
      opponent.cards = [
        [
          new SkyjoCard(1, true),
          new SkyjoCard(1, true),
          new SkyjoCard(2, true),
        ],
      ]

      skyjo.nextTurn()

      expect(skyjo.roundState).toBe<RoundState>("over")
      expect(skyjo.status).toBe<GameStatus>("finished")
      expect(player.score).toBe(90 + (1 + 1 + 3) * 2)
    })
  })

  describe("start new round", () => {
    it("should start a new round and wait for players to turn initial cards if there is a card to turn at the beginning of the game", () => {
      skyjo.roundNumber = 1
      skyjo.firstPlayerToFinish = player
      skyjo.selectedCard = new SkyjoCard(1, true)
      skyjo.lastMove = "pickFromDrawPile"
      player.cards = [
        [
          new SkyjoCard(1, true),
          new SkyjoCard(1, true),
          new SkyjoCard(3, true),
        ],
      ]

      skyjo.startNewRound()

      expect(skyjo.roundNumber).toBe(2)
      expect(skyjo.firstPlayerToFinish).toBeNull()
      expect(skyjo.selectedCard).toBeNull()
      expect(skyjo.lastMove).toBe<Move>("turn")
      skyjo.players.forEach((player) => {
        expect(player.cards.flat()).toHaveLength(CARDS_PER_PLAYER)
        expect(player.hasRevealedCardCount(0)).toBeTruthy()
      })
      expect(skyjo.roundState).toBe<RoundState>(
        "waitingPlayersToTurnInitialCards",
      )
      expect(skyjo.turnState).toBe<TurnState>("chooseAPile")
    })

    it("should start a new round and not wait for players to turn initial cards if there is no card to turn at the beginning of the game", () => {
      skyjo.settings.initialTurnedCount = 0
      skyjo.roundNumber = 1
      skyjo.firstPlayerToFinish = player
      skyjo.selectedCard = new SkyjoCard(1, true)
      skyjo.lastMove = "pickFromDrawPile"
      player.cards = [
        [
          new SkyjoCard(1, true),
          new SkyjoCard(1, true),
          new SkyjoCard(3, true),
        ],
      ]

      skyjo.startNewRound()

      expect(skyjo.roundNumber).toBe(2)
      expect(skyjo.firstPlayerToFinish).toBeNull()
      expect(skyjo.selectedCard).toBeNull()
      expect(skyjo.lastMove).toBe<Move>("turn")
      skyjo.players.forEach((player) => {
        expect(player.cards.flat()).toHaveLength(CARDS_PER_PLAYER)
        expect(player.hasRevealedCardCount(0)).toBeTruthy()
      })
      expect(skyjo.roundState).toBe<RoundState>("playing")
      expect(skyjo.turnState).toBe<TurnState>("chooseAPile")
    })
  })

  describe("Restart the game if all players want to replay", () => {
    it("shouldn't restart the game", () => {
      skyjo.status = "finished"
      player.wantReplay = false
      opponent.wantReplay = true

      skyjo.restartGameIfAllPlayersWantReplay()

      expect(skyjo.status).toBe<GameStatus>("finished")
    })

    it("should restart the game", () => {
      skyjo.status = "finished"
      skyjo.players.forEach((player) => {
        player.wantReplay = true
      })

      skyjo.restartGameIfAllPlayersWantReplay()

      expect(skyjo.status).toBe<GameStatus>("lobby")
    })
  })

  it("should reset the game", () => {
    skyjo.roundNumber = 10
    skyjo.players.forEach((player) => {
      player.scores = [10, 20]
      player.score = 30
      player.wantReplay = true
    })

    skyjo.reset()

    expect(skyjo.roundNumber).toBe(1)
    skyjo.players.forEach((player) => {
      expect(player.scores).toStrictEqual([])
      expect(player.score).toBe(0)
      expect(player.wantReplay).toBeFalsy()
    })
  })

  it("should return json", () => {
    const gameToJson = skyjo.toJson()

    expect(gameToJson).toStrictEqual({
      id: skyjo.id,
      status: "lobby",
      roundState: "waitingPlayersToTurnInitialCards",
      admin: player.toJson(),
      players: skyjo.players.map((player) => player.toJson()),
      selectedCard: undefined,
      lastDiscardCardValue: skyjo["discardPile"][["_discardPile"].length - 1],
      lastMove: "turn",
      turn: 0,
      turnState: "chooseAPile",
      settings: skyjo.settings.toJson(),
    })
  })
})
