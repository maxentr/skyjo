import { Skyjo } from "@/class/Skyjo"
import { SkyjoCard } from "@/class/SkyjoCard"
import { SkyjoPlayer } from "@/class/SkyjoPlayer"
import { SkyjoSettings } from "@/class/SkyjoSettings"
import { ERROR } from "shared/constants"
import { GameStatus } from "shared/types/game"
import { Move, RoundState, TurnState } from "shared/types/skyjo"
import { beforeEach, describe, expect, it } from "vitest"
import { TEST_SOCKET_ID } from "../constants"

const TOTAL_CARDS = 150
const CARDS_PER_PLAYER = 12

describe("Skyjo", () => {
  let skyjo: Skyjo
  let player: SkyjoPlayer
  let settings: SkyjoSettings
  let opponent: SkyjoPlayer

  beforeEach(() => {
    player = new SkyjoPlayer("player1", TEST_SOCKET_ID, "bee")
    settings = new SkyjoSettings()
    skyjo = new Skyjo(player, settings)
    skyjo.addPlayer(player)

    opponent = new SkyjoPlayer("player2", "socketId456", "elephant")
    skyjo.addPlayer(opponent)
  })

  //#region Game class
  it("should get player", () => {
    expect(skyjo.getPlayer(TEST_SOCKET_ID)).toBe(player)
    expect(skyjo.getPlayer("socketId456")).toBe(opponent)
  })

  describe("add player", () => {
    it("should add player", () => {
      settings.maxPlayers = 3
      const newPlayer = new SkyjoPlayer("player3", "socketId789", "turtle")

      expect(() => skyjo.addPlayer(newPlayer)).not.toThrowError()
      expect(skyjo.players).toHaveLength(3)
    })

    it("should not add player if max players is reached", () => {
      settings.maxPlayers = 2
      const newPlayer = new SkyjoPlayer("player3", "socketId789", "turtle")

      expect(() => skyjo.addPlayer(newPlayer)).toThrowError("game-is-full")
      expect(skyjo.players).toHaveLength(2)
    })
  })

  describe("change admin", () => {
    it("should change the admin of the game", () => {
      skyjo.removePlayer(TEST_SOCKET_ID)
      expect(() => skyjo.changeAdmin()).not.toThrowError()
      expect(skyjo.admin).toBe(opponent)
    })

    it("should not change the admin because there are no players", () => {
      skyjo.removePlayer(TEST_SOCKET_ID)
      skyjo.removePlayer("socketId456")
      expect(() => skyjo.changeAdmin()).toThrowError("no-players")
    })
  })

  it("should check if the player is admin", () => {
    expect(skyjo.isAdmin(TEST_SOCKET_ID)).toBeTruthy()
    expect(skyjo.isAdmin("socketId456")).toBeFalsy()
  })

  it("should check if it's player turn", () => {
    expect(skyjo.checkTurn(TEST_SOCKET_ID)).toBeTruthy()
    expect(skyjo.checkTurn("socketId456")).toBeFalsy()
  })

  describe("have at least min players connected", () => {
    it("should return true if there are at least min players connected", () => {
      expect(skyjo.haveAtLeastMinPlayersConnected()).toBeTruthy()
    })

    it("should return false if there are less than min players connected", () => {
      skyjo.removePlayer(TEST_SOCKET_ID)
      expect(skyjo.haveAtLeastMinPlayersConnected()).toBeFalsy()
    })
  })
  //#endregion

  describe("start", () => {
    it("should not start the game if min players is not reached", () => {
      skyjo.removePlayer("socketId456")
      expect(() => skyjo.start()).toThrowError(ERROR.TOO_FEW_PLAYERS)
    })

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
      const opponent2 = new SkyjoPlayer("player3", TEST_SOCKET_ID, "elephant")
      skyjo.addPlayer(opponent2)

      const opponent3 = new SkyjoPlayer("player4", TEST_SOCKET_ID, "elephant")
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

      expect(skyjo.selectedCardValue).toBeNull()
      expect(skyjo.turnState).toBe<TurnState>("chooseAPile")

      skyjo.drawCard()

      expect(skyjo.selectedCardValue).not.toBeNull()
      expect(skyjo.turnState).toBe<TurnState>("throwOrReplace")
      expect(skyjo.lastMove).toBe<Move>("pickFromDrawPile")
    })

    it("should draw card and reload the draw pile", () => {
      skyjo.start()

      skyjo["discardPile"] = [...skyjo["drawPile"], ...skyjo["discardPile"]]
      skyjo["drawPile"] = []

      const nbCardsUsedByPlayers = skyjo.players.length * CARDS_PER_PLAYER

      expect(skyjo.selectedCardValue).toBeNull()
      expect(skyjo.turnState).toBe<TurnState>("chooseAPile")
      expect(skyjo["drawPile"]).toHaveLength(0)
      expect(skyjo["discardPile"]).toHaveLength(
        TOTAL_CARDS - nbCardsUsedByPlayers,
      )

      skyjo.drawCard()

      expect(skyjo.selectedCardValue).not.toBeNull()
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

      expect(skyjo.selectedCardValue).toBeNull()
      expect(skyjo.turnState).toBe<TurnState>("chooseAPile")

      skyjo.pickFromDiscard()

      expect(skyjo.selectedCardValue).not.toBeNull()
      expect(skyjo.turnState).toBe<TurnState>("replaceACard")
      expect(skyjo.lastMove).toBe<Move>("pickFromDiscardPile")
    })

    it("should not pick a card from the discard pile if it's empty", () => {
      skyjo.start()
      skyjo["discardPile"] = []

      expect(skyjo.selectedCardValue).toBeNull()
      expect(skyjo.turnState).toBe<TurnState>("chooseAPile")

      skyjo.pickFromDiscard()

      expect(skyjo.selectedCardValue).toBeNull()
      expect(skyjo.turnState).toBe<TurnState>("chooseAPile")
    })
  })

  it("should discard card", () => {
    skyjo.discardCard(10)

    expect(skyjo.selectedCardValue).toBeNull()
    expect(skyjo["discardPile"]).toHaveLength(1)
    expect(skyjo.turnState).toBe<TurnState>("turnACard")
    expect(skyjo.lastMove).toBe<Move>("throw")
  })

  it("should replace a card", () => {
    skyjo.start()

    const oldCardValue = player.cards[0][0].value
    skyjo.turn = 0
    skyjo.selectedCardValue = 10

    skyjo.replaceCard(0, 0)

    expect(player.cards[0][0].isVisible).toBeTruthy()
    expect(player.cards[0][0].value).toBe(10)
    expect(skyjo["discardPile"]).include(oldCardValue)
    expect(skyjo.selectedCardValue).toBeNull()
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
      const opponent2 = new SkyjoPlayer("player3", TEST_SOCKET_ID, "elephant")
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
          new SkyjoCard(3, true),
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

    it("should set next turn and discard 2 column and 2 row", () => {
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
          new SkyjoCard(5, true),
        ],
        [
          new SkyjoCard(1, true),
          new SkyjoCard(6, true),
          new SkyjoCard(10, true),
        ],
      ]

      skyjo.nextTurn()

      const remaningColumns = 2
      expect(player.cards.length).toBe(remaningColumns)

      const remaningCardsPerColumn = 1
      player.cards.forEach((column) => {
        expect(column.length).toBe(remaningCardsPerColumn)
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

    it("should set next turn, end the round and not end the game", () => {
      skyjo.start()
      skyjo.roundState = "playing"
      skyjo.firstPlayerToFinish = player
      skyjo.turn = 0

      skyjo.nextTurn()

      expect(skyjo.roundState).toBe<RoundState>("playing")
      expect(skyjo.status).toBe<GameStatus>("playing")
    })

    it("should set next turn, end the round and not double score of the first player", () => {
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

    it("should set next turn, end the round and double score of the first player", () => {
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

    it("should set next turn, end the round and not double score of the first player because it's 0", () => {
      skyjo.start()
      skyjo.firstPlayerToFinish = player
      skyjo.turn = 1

      player.cards = [
        [
          new SkyjoCard(0, true),
          new SkyjoCard(-2, true),
          new SkyjoCard(2, true),
        ],
      ]
      opponent.cards = [
        [
          new SkyjoCard(-2, true),
          new SkyjoCard(-2, true),
          new SkyjoCard(-1, true),
        ],
      ]

      skyjo.nextTurn()

      expect(skyjo.roundState).toBe<RoundState>("over")
      expect(skyjo.status).toBe<GameStatus>("playing")
      expect(player.score).toBe(0 + -2 + 2)
    })

    it("should set next turn, end the round and not double score of the first player because it's negative", () => {
      skyjo.start()
      skyjo.firstPlayerToFinish = player
      skyjo.turn = 1

      player.cards = [
        [
          new SkyjoCard(0, true),
          new SkyjoCard(0, true),
          new SkyjoCard(-2, true),
        ],
      ]
      opponent.cards = [
        [
          new SkyjoCard(-2, true),
          new SkyjoCard(-2, true),
          new SkyjoCard(-1, true),
        ],
      ]

      skyjo.nextTurn()

      expect(skyjo.roundState).toBe<RoundState>("over")
      expect(skyjo.status).toBe<GameStatus>("playing")
      expect(player.score).toBe(0 + 0 + -2)
    })

    it("should set next turn, end the round, double score of the first player and end the game", () => {
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
      skyjo.selectedCardValue = 1
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
      expect(skyjo.selectedCardValue).toBeNull()
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
      skyjo.selectedCardValue = 1
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
      expect(skyjo.selectedCardValue).toBeNull()
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
      selectedCardValue: null,
      lastDiscardCardValue: skyjo["discardPile"][["_discardPile"].length - 1],
      lastMove: "turn",
      turn: 0,
      turnState: "chooseAPile",
      settings: skyjo.settings.toJson(),
    })
  })
})
