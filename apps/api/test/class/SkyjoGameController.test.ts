import { Skyjo } from "@/class/Skyjo"
import { SkyjoCard } from "@/class/SkyjoCard"
import SkyjoGameController from "@/class/SkyjoGameController"
import { SkyjoPlayer } from "@/class/SkyjoPlayer"
import { SkyjoSettings } from "@/class/SkyjoSettings"
import { SkyjoSocket } from "@/types/skyjoSocket"
import { ERROR } from "shared/constants"
import { GameStatus } from "shared/types/game"
import { ConnectionStatus } from "shared/types/player"
import { RoundState, TurnState } from "shared/types/skyjo"
import { ChangeSettings } from "shared/validations/changeSettings"
import { CreatePlayer } from "shared/validations/player"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { TEST_SOCKET_ID, TEST_UNKNOWN_GAME_ID } from "../constants"

describe("Skyjo", () => {
  const instance = SkyjoGameController.getInstance()
  let socket: SkyjoSocket

  beforeEach(() => {
    instance["games"] = []
    socket = {
      emit: vi.fn(),
      on: vi.fn(),
      join: vi.fn(),
      to: vi.fn(() => ({ emit: vi.fn() })),
      leave: vi.fn(),
      data: {},
      id: TEST_SOCKET_ID,
      connected: true,
      disconnected: false,
      recovered: true,
    } as any
  })

  describe("getInstance", () => {
    it("should create and return the instance", () => {
      const instance = SkyjoGameController.getInstance()
      expect(SkyjoGameController.getInstance()).toBe(instance)
    })

    it("should return the instance", () => {
      expect(SkyjoGameController.getInstance()).toBe(instance)
    })
  })

  it("should create a new game", async () => {
    const player: CreatePlayer = {
      username: "player1",
      avatar: "bee",
    }

    await instance.onCreate(socket, player)

    const gameId = socket.data.gameId
    const game = instance["getGame"](gameId)

    expect(gameId).toBeDefined()
    expect(socket.emit).toHaveBeenNthCalledWith(1, "join", game?.toJson())
    expect(socket.emit).toHaveBeenNthCalledWith(
      2,
      "message",
      expect.objectContaining({ type: "player-joined", username: "player1" }),
    )
    expect(socket.emit).toHaveBeenNthCalledWith(
      3,
      "game",
      expect.objectContaining({ id: gameId }),
    )
  })

  describe("on get", () => {
    it("should not get a game if it does not exist", async () => {
      socket.data.gameId = TEST_UNKNOWN_GAME_ID

      expect(await instance.onGet(socket)).toBeUndefined()

      expect(socket.emit).not.toHaveBeenCalled()
    })

    it("should return the game", async () => {
      const player: CreatePlayer = {
        username: "player1",
        avatar: "bee",
      }

      await instance.onCreate(socket, player)

      const gameId = socket.data.gameId
      await instance.onGet(socket)
      const game = instance["getGame"](gameId)

      expect(gameId).toBeDefined()
      expect(socket.emit).toHaveBeenNthCalledWith(1, "join", game?.toJson())
      expect(socket.emit).toHaveBeenNthCalledWith(
        2,
        "message",
        expect.objectContaining({ type: "player-joined", username: "player1" }),
      )
      expect(socket.emit).toHaveBeenNthCalledWith(
        3,
        "game",
        expect.objectContaining({ id: gameId }),
      )
    })
  })

  describe("on find", () => {
    it("should not find a game so it should create a new public game", async () => {
      const player: CreatePlayer = {
        username: "player1",
        avatar: "bee",
      }

      await instance.onFind(socket, player)

      const gameId = socket.data.gameId
      const game = instance["getGame"](gameId)

      expect(gameId).toBeDefined()
      expect(socket.emit).toHaveBeenNthCalledWith(1, "join", game?.toJson())
      expect(socket.emit).toHaveBeenNthCalledWith(
        2,
        "message",
        expect.objectContaining({ type: "player-joined", username: "player1" }),
      )
      expect(socket.emit).toHaveBeenNthCalledWith(
        3,
        "game",
        expect.objectContaining({ id: gameId }),
      )
    })

    it("should find a game and join it", async () => {
      const opponent = new SkyjoPlayer("player1", "socket456", "elephant")
      const game = new Skyjo(opponent, new SkyjoSettings(false))
      game.addPlayer(opponent)
      instance["games"].push(game)

      const player: CreatePlayer = {
        username: "player2",
        avatar: "bee",
      }

      await instance.onFind(socket, player)

      expect(game.players.length).toBe(2)
      expect(socket.emit).toHaveBeenNthCalledWith(1, "join", game?.toJson())
      expect(socket.emit).toHaveBeenNthCalledWith(
        2,
        "message",
        expect.objectContaining({ type: "player-joined", username: "player2" }),
      )
      expect(socket.emit).toHaveBeenNthCalledWith(
        3,
        "game",
        expect.objectContaining({ id: game.id }),
      )
    })
  })

  describe("on join", () => {
    it("should throw if it does not exist", async () => {
      socket.data.gameId = TEST_UNKNOWN_GAME_ID
      const player: CreatePlayer = {
        username: "player1",
        avatar: "bee",
      }

      await expect(() =>
        instance.onJoin(socket, TEST_UNKNOWN_GAME_ID, player),
      ).rejects.toThrowError(ERROR.GAME_NOT_FOUND)

      expect(socket.emit).not.toHaveBeenCalled()
    })

    it("should throw if it's full", async () => {
      const opponent = new SkyjoPlayer("player1", "socket456", "elephant")
      const game = new Skyjo(opponent, new SkyjoSettings(false, 2))
      game.addPlayer(opponent)
      instance["games"].push(game)
      const opponent2 = new SkyjoPlayer("player2", "socket456", "elephant")
      game.addPlayer(opponent2)

      const player: CreatePlayer = {
        username: "player2",
        avatar: "bee",
      }

      await expect(() =>
        instance.onJoin(socket, game.id, player),
      ).rejects.toThrowError("game-is-full")

      expect(socket.emit).not.toHaveBeenCalled()
    })

    it("sould throw if game already started", async () => {
      const opponent = new SkyjoPlayer("player1", "socket456", "elephant")
      const game = new Skyjo(opponent, new SkyjoSettings(false))
      instance["games"].push(game)
      game.addPlayer(opponent)

      const opponent2 = new SkyjoPlayer("player2", "socket456", "elephant")
      game.addPlayer(opponent2)

      game.start()

      const player: CreatePlayer = {
        username: "player2",
        avatar: "bee",
      }

      await expect(() =>
        instance.onJoin(socket, game.id, player),
      ).rejects.toThrowError("game-already-started")

      expect(socket.emit).not.toHaveBeenCalled()
    })

    it("should join the game", async () => {
      const opponent = new SkyjoPlayer("player1", "socket456", "elephant")
      const game = new Skyjo(opponent, new SkyjoSettings(false))
      game.addPlayer(opponent)
      instance["games"].push(game)

      const player: CreatePlayer = {
        username: "player2",
        avatar: "bee",
      }

      await instance.onJoin(socket, game.id, player)

      expect(game.players.length).toBe(2)
      expect(socket.emit).toHaveBeenNthCalledWith(1, "join", game?.toJson())
      expect(socket.emit).toHaveBeenNthCalledWith(
        2,
        "message",
        expect.objectContaining({ type: "player-joined", username: "player2" }),
      )
      expect(socket.emit).toHaveBeenNthCalledWith(
        3,
        "game",
        expect.objectContaining({ id: game.id }),
      )
    })
  })

  describe("on settings change", () => {
    it("should throw if no game is found", async () => {
      socket.data.gameId = TEST_UNKNOWN_GAME_ID

      const newSettings: ChangeSettings = {
        private: false,
        allowSkyjoForColumn: true,
        allowSkyjoForRow: true,
        initialTurnedCount: 2,
        cardPerRow: 6,
        cardPerColumn: 8,
      }

      await expect(() =>
        instance.onSettingsChange(socket, newSettings),
      ).rejects.toThrowError(ERROR.GAME_NOT_FOUND)

      expect(socket.emit).not.toHaveBeenCalled()
    })
    it("should throw if user is not admin", async () => {
      const opponent = new SkyjoPlayer("player1", "socket456", "elephant")
      const game = new Skyjo(opponent, new SkyjoSettings(false))
      game.addPlayer(opponent)
      instance["games"].push(game)

      const player = new SkyjoPlayer("player1", TEST_SOCKET_ID, "elephant")
      game.addPlayer(player)
      socket.data.gameId = game.id

      const newSettings: ChangeSettings = {
        private: false,
        allowSkyjoForColumn: true,
        allowSkyjoForRow: true,
        initialTurnedCount: 2,
        cardPerRow: 6,
        cardPerColumn: 8,
      }
      await expect(() =>
        instance.onSettingsChange(socket, newSettings),
      ).rejects.toThrowError(ERROR.NOT_ALLOWED)

      expect(socket.emit).not.toHaveBeenCalled()
    })

    it("should change the game settings", async () => {
      const player = new SkyjoPlayer("player1", TEST_SOCKET_ID, "elephant")
      const game = new Skyjo(player, new SkyjoSettings(false))
      game.addPlayer(player)
      instance["games"].push(game)
      socket.data.gameId = game.id

      const newSettings: ChangeSettings = {
        private: true,
        allowSkyjoForColumn: true,
        allowSkyjoForRow: true,
        initialTurnedCount: 2,
        cardPerRow: 6,
        cardPerColumn: 8,
      }
      await instance.onSettingsChange(socket, newSettings)

      expect(game.settings).toBeInstanceOf(SkyjoSettings)
      expect(game.settings.toJson()).toStrictEqual({
        ...newSettings,
        maxPlayers: 8,
      })
    })
  })

  describe("on game start", () => {
    it("should throw if the game does not exist", async () => {
      socket.data.gameId = TEST_UNKNOWN_GAME_ID

      await expect(() => instance.onGameStart(socket)).rejects.toThrowError(
        ERROR.GAME_NOT_FOUND,
      )

      expect(socket.emit).not.toHaveBeenCalled()
    })

    it("should throw if player is not admin", async () => {
      const opponent = new SkyjoPlayer("player1", "socket456", "elephant")
      const game = new Skyjo(opponent, new SkyjoSettings(false))
      game.addPlayer(opponent)
      instance["games"].push(game)
      socket.data.gameId = game.id

      const player = new SkyjoPlayer("player1", TEST_SOCKET_ID, "elephant")
      game.addPlayer(player)

      await expect(() => instance.onGameStart(socket)).rejects.toThrowError(
        ERROR.NOT_ALLOWED,
      )

      expect(socket.emit).not.toHaveBeenCalled()
    })

    it("should start the game", async () => {
      const player = new SkyjoPlayer("player1", TEST_SOCKET_ID, "elephant")
      const game = new Skyjo(player, new SkyjoSettings(false))
      game.addPlayer(player)
      instance["games"].push(game)
      socket.data.gameId = game.id

      const opponent = new SkyjoPlayer("player2", "socket456", "elephant")
      game.addPlayer(opponent)

      await instance.onGameStart(socket)

      expect(game.status).toBe<GameStatus>("playing")
      expect(game.roundState).toBe<RoundState>(
        "waitingPlayersToTurnInitialCards",
      )
    })
  })

  describe("game actions", () => {
    describe("on reveal card", () => {
      it("should throw if game does not exist", async () => {
        socket.data.gameId = TEST_UNKNOWN_GAME_ID

        await expect(() =>
          instance.onRevealCard(socket, { column: 0, row: 0 }),
        ).rejects.toThrowError(ERROR.GAME_NOT_FOUND)

        expect(socket.emit).not.toHaveBeenCalled()
      })

      it("should throw if player is not in the game", async () => {
        const player1 = new SkyjoPlayer("player1", "socket2131123", "elephant")
        const game = new Skyjo(player1, new SkyjoSettings(false))
        game.addPlayer(player1)
        instance["games"].push(game)
        const opponent = new SkyjoPlayer(
          "player2",
          "socketId132312",
          "elephant",
        )
        game.addPlayer(opponent)

        socket.data.gameId = game.id

        await expect(() =>
          instance.onRevealCard(socket, { column: 0, row: 0 }),
        ).rejects.toThrowError(ERROR.PLAYER_NOT_FOUND)

        expect(socket.emit).not.toHaveBeenCalled()
      })

      it("should throw if game is not started", async () => {
        const player = new SkyjoPlayer("player1", TEST_SOCKET_ID, "elephant")
        const game = new Skyjo(player, new SkyjoSettings(false))
        game.addPlayer(player)
        instance["games"].push(game)
        socket.data.gameId = game.id

        const opponent = new SkyjoPlayer(
          "player2",
          "socketId132312",
          "elephant",
        )
        game.addPlayer(opponent)

        await expect(() =>
          instance.onRevealCard(socket, { column: 0, row: 0 }),
        ).rejects.toThrowError(ERROR.NOT_ALLOWED)

        expect(socket.emit).not.toHaveBeenCalled()
      })

      it("should not reveal the card if player already revealed the right card amount", async () => {
        const player = new SkyjoPlayer("player1", TEST_SOCKET_ID, "elephant")
        const game = new Skyjo(player, new SkyjoSettings(false))
        game.addPlayer(player)
        instance["games"].push(game)
        const opponent = new SkyjoPlayer(
          "player2",
          "socketId132312",
          "elephant",
        )
        game.addPlayer(opponent)
        game.start()
        player.turnCard(0, 0)
        player.turnCard(0, 1)

        socket.data.gameId = game.id

        instance.onRevealCard(socket, { column: 0, row: 2 })

        expect(player.hasRevealedCardCount(2)).toBeTruthy()
        expect(game.status).toBe<GameStatus>("playing")
        expect(game.roundState).toBe<RoundState>(
          "waitingPlayersToTurnInitialCards",
        )
      })

      it("should reveal the card", async () => {
        const player = new SkyjoPlayer("player1", TEST_SOCKET_ID, "elephant")
        const game = new Skyjo(player, new SkyjoSettings(false))
        game.addPlayer(player)
        instance["games"].push(game)
        const opponent = new SkyjoPlayer(
          "player2",
          "socketId132312",
          "elephant",
        )
        game.addPlayer(opponent)
        game.start()
        player.turnCard(0, 0)

        socket.data.gameId = game.id

        instance.onRevealCard(socket, { column: 0, row: 1 })

        expect(player.hasRevealedCardCount(2)).toBeTruthy()
        expect(game.status).toBe<GameStatus>("playing")
        expect(game.roundState).toBe<RoundState>(
          "waitingPlayersToTurnInitialCards",
        )
      })
    })

    describe("on pick card", () => {
      it("should throw if game does not exist", async () => {
        socket.data.gameId = TEST_UNKNOWN_GAME_ID

        await expect(() =>
          instance.onPickCard(socket, { pile: "draw" }),
        ).rejects.toThrowError(ERROR.GAME_NOT_FOUND)

        expect(socket.emit).not.toHaveBeenCalled()
      })

      it("should throw if player is not in the game", async () => {
        const opponent = new SkyjoPlayer("player1", "socket456", "elephant")
        const game = new Skyjo(opponent, new SkyjoSettings(false))
        game.addPlayer(opponent)
        instance["games"].push(game)
        socket.data.gameId = game.id

        const opponent2 = new SkyjoPlayer(
          "opponent2",
          "socketId9887",
          "elephant",
        )
        game.addPlayer(opponent2)

        game.start()

        opponent.turnCard(0, 0)
        opponent.turnCard(0, 1)
        opponent2.turnCard(0, 0)
        opponent2.turnCard(0, 1)

        game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)
        game.turn = 0

        await expect(() =>
          instance.onPickCard(socket, { pile: "draw" }),
        ).rejects.toThrowError(ERROR.PLAYER_NOT_FOUND)

        expect(socket.emit).not.toHaveBeenCalled()
      })

      it("should throw if game is not started", async () => {
        const player = new SkyjoPlayer("player1", TEST_SOCKET_ID, "elephant")
        const game = new Skyjo(player, new SkyjoSettings(false))
        game.addPlayer(player)
        instance["games"].push(game)
        socket.data.gameId = game.id

        const opponent = new SkyjoPlayer(
          "player2",
          "socketId132312",
          "elephant",
        )
        game.addPlayer(opponent)

        await expect(() =>
          instance.onPickCard(socket, { pile: "draw" }),
        ).rejects.toThrowError(ERROR.NOT_ALLOWED)

        expect(socket.emit).not.toHaveBeenCalled()
      })

      it("should throw if it's not the player turn", async () => {
        const player = new SkyjoPlayer("player1", TEST_SOCKET_ID, "elephant")
        const game = new Skyjo(player, new SkyjoSettings(false))
        game.addPlayer(player)
        instance["games"].push(game)
        socket.data.gameId = game.id

        const opponent = new SkyjoPlayer(
          "player2",
          "socketId132312",
          "elephant",
        )
        game.addPlayer(opponent)

        game.start()

        opponent.turnCard(0, 0)
        opponent.turnCard(0, 1)
        player.turnCard(0, 0)
        player.turnCard(0, 1)
        game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)

        game.turn = 1

        await expect(() =>
          instance.onPickCard(socket, { pile: "draw" }),
        ).rejects.toThrowError("not-your-turn")

        expect(socket.emit).not.toHaveBeenCalled()
      })

      it("should throw if it's not the waited move", async () => {
        const player = new SkyjoPlayer("player1", TEST_SOCKET_ID, "elephant")
        const game = new Skyjo(player, new SkyjoSettings(false))
        socket.data.gameId = game.id
        game.addPlayer(player)
        instance["games"].push(game)
        const opponent = new SkyjoPlayer(
          "player2",
          "socketId132312",
          "elephant",
        )
        game.addPlayer(opponent)
        game.start()

        player.turnCard(0, 0)
        player.turnCard(0, 1)
        opponent.turnCard(0, 0)
        opponent.turnCard(0, 1)

        game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)
        game.turn = 0
        game.turnState = "replaceACard"

        await expect(() =>
          instance.onPickCard(socket, { pile: "draw" }),
        ).rejects.toThrowError(ERROR.INVALID_TURN_STATE)

        expect(socket.emit).not.toHaveBeenCalled()
      })

      it("should pick a card from the draw pile", async () => {
        const player = new SkyjoPlayer("player1", TEST_SOCKET_ID, "elephant")
        const game = new Skyjo(player, new SkyjoSettings(false))
        socket.data.gameId = game.id
        game.addPlayer(player)
        instance["games"].push(game)

        const opponent = new SkyjoPlayer(
          "player2",
          "socketId132312",
          "elephant",
        )
        game.addPlayer(opponent)

        game.start()

        player.turnCard(0, 0)
        player.turnCard(0, 1)
        opponent.turnCard(0, 0)
        opponent.turnCard(0, 1)

        game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)
        game.turn = 0

        await instance.onPickCard(socket, { pile: "draw" })

        expect(game.selectedCard).toBeInstanceOf(SkyjoCard)
        expect(game.turnState).toBe<TurnState>("throwOrReplace")
      })

      it("should pick a card from the discard pile", async () => {
        const player = new SkyjoPlayer("player1", TEST_SOCKET_ID, "elephant")
        const game = new Skyjo(player, new SkyjoSettings(false))
        socket.data.gameId = game.id
        game.addPlayer(player)
        instance["games"].push(game)

        const opponent = new SkyjoPlayer(
          "player2",
          "socketId132312",
          "elephant",
        )
        game.addPlayer(opponent)

        game.start()

        player.turnCard(0, 0)
        player.turnCard(0, 1)
        opponent.turnCard(0, 0)
        opponent.turnCard(0, 1)

        game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)
        game.turn = 0

        await instance.onPickCard(socket, { pile: "discard" })

        expect(socket.emit).toHaveBeenCalledOnce()
        expect(game.selectedCard).toBeInstanceOf(SkyjoCard)
        expect(game.turnState).toBe<TurnState>("replaceACard")
      })
    })

    describe("on replace card", () => {
      it("should throw if the game does not exist", async () => {
        socket.data.gameId = TEST_UNKNOWN_GAME_ID

        await expect(() =>
          instance.onReplaceCard(socket, { column: 0, row: 0 }),
        ).rejects.toThrowError(ERROR.GAME_NOT_FOUND)

        expect(socket.emit).not.toHaveBeenCalled()
      })

      it("should throw if player is not in the game", async () => {
        const opponent = new SkyjoPlayer("player1", "socket456", "elephant")
        const game = new Skyjo(opponent, new SkyjoSettings(false))
        game.addPlayer(opponent)
        instance["games"].push(game)
        socket.data.gameId = game.id

        const opponent2 = new SkyjoPlayer(
          "opponent2",
          "socketId9887",
          "elephant",
        )
        game.addPlayer(opponent2)

        game.start()

        opponent.turnCard(0, 0)
        opponent.turnCard(0, 1)
        opponent2.turnCard(0, 0)
        opponent2.turnCard(0, 1)

        game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)
        game.turn = 0

        await expect(() =>
          instance.onReplaceCard(socket, { column: 0, row: 2 }),
        ).rejects.toThrowError(ERROR.PLAYER_NOT_FOUND)

        expect(socket.emit).not.toHaveBeenCalled()
      })

      it("should throw if game is not started", async () => {
        const player = new SkyjoPlayer("player1", TEST_SOCKET_ID, "elephant")
        const game = new Skyjo(player, new SkyjoSettings(false))
        game.addPlayer(player)
        instance["games"].push(game)
        socket.data.gameId = game.id

        const opponent = new SkyjoPlayer(
          "player2",
          "socketId132312",
          "elephant",
        )
        game.addPlayer(opponent)

        await expect(() =>
          instance.onReplaceCard(socket, { column: 0, row: 0 }),
        ).rejects.toThrowError(ERROR.NOT_ALLOWED)

        expect(socket.emit).not.toHaveBeenCalled()
      })

      it("should throw if it's not the player turn", async () => {
        const player = new SkyjoPlayer("player1", TEST_SOCKET_ID, "elephant")
        const game = new Skyjo(player, new SkyjoSettings(false))
        game.addPlayer(player)
        instance["games"].push(game)
        socket.data.gameId = game.id

        const opponent = new SkyjoPlayer(
          "player2",
          "socketId132312",
          "elephant",
        )
        game.addPlayer(opponent)

        game.start()

        opponent.turnCard(0, 0)
        opponent.turnCard(0, 1)
        player.turnCard(0, 0)
        player.turnCard(0, 1)
        game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)

        game.turn = 1

        await expect(() =>
          instance.onReplaceCard(socket, { column: 0, row: 2 }),
        ).rejects.toThrowError("not-your-turn")

        expect(socket.emit).not.toHaveBeenCalled()
      })

      it("should throw if it's not the waited move", async () => {
        const player = new SkyjoPlayer("player1", TEST_SOCKET_ID, "elephant")
        const game = new Skyjo(player, new SkyjoSettings(false))
        socket.data.gameId = game.id
        game.addPlayer(player)
        instance["games"].push(game)
        const opponent = new SkyjoPlayer(
          "player2",
          "socketId132312",
          "elephant",
        )
        game.addPlayer(opponent)
        game.start()

        player.turnCard(0, 0)
        player.turnCard(0, 1)
        opponent.turnCard(0, 0)
        opponent.turnCard(0, 1)

        game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)
        game.turn = 0
        game.turnState = "chooseAPile"

        await expect(() =>
          instance.onReplaceCard(socket, { column: 0, row: 2 }),
        ).rejects.toThrowError(ERROR.INVALID_TURN_STATE)

        expect(socket.emit).not.toHaveBeenCalled()
      })

      it("should replace a card and finish the turn", async () => {
        const player = new SkyjoPlayer("player1", TEST_SOCKET_ID, "elephant")
        const game = new Skyjo(player, new SkyjoSettings(false))
        socket.data.gameId = game.id
        game.addPlayer(player)
        instance["games"].push(game)
        const opponent = new SkyjoPlayer(
          "player2",
          "socketId132312",
          "elephant",
        )
        game.addPlayer(opponent)
        game.start()

        player.turnCard(0, 0)
        player.turnCard(0, 1)
        opponent.turnCard(0, 0)
        opponent.turnCard(0, 1)

        game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)
        game.turn = 0
        game.selectedCard = new SkyjoCard(0, true)
        game.turnState = "replaceACard"

        await instance.onReplaceCard(socket, { column: 0, row: 2 })

        expect(socket.emit).toHaveBeenCalledOnce()
        expect(game.selectedCard).toBeNull()
        expect(game.turn).toBe(1)
        expect(game.turnState).toBe<TurnState>("chooseAPile")
      })
    })

    describe("on discard card", () => {
      it("should throw if the game does not exist", async () => {
        socket.data.gameId = TEST_UNKNOWN_GAME_ID

        await expect(() => instance.onDiscardCard(socket)).rejects.toThrowError(
          ERROR.GAME_NOT_FOUND,
        )

        expect(socket.emit).not.toHaveBeenCalled()
      })

      it("should throw if player is not in the game", async () => {
        const opponent = new SkyjoPlayer("player1", "socket456", "elephant")
        const game = new Skyjo(opponent, new SkyjoSettings(false))
        game.addPlayer(opponent)
        instance["games"].push(game)
        socket.data.gameId = game.id

        const opponent2 = new SkyjoPlayer(
          "opponent2",
          "socketId9887",
          "elephant",
        )
        game.addPlayer(opponent2)

        game.start()

        opponent.turnCard(0, 0)
        opponent.turnCard(0, 1)
        opponent2.turnCard(0, 0)
        opponent2.turnCard(0, 1)

        game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)
        game.turn = 0

        await expect(() => instance.onDiscardCard(socket)).rejects.toThrowError(
          ERROR.PLAYER_NOT_FOUND,
        )

        expect(socket.emit).not.toHaveBeenCalled()
      })

      it("should throw if game is not started", async () => {
        const player = new SkyjoPlayer("player1", TEST_SOCKET_ID, "elephant")
        const game = new Skyjo(player, new SkyjoSettings(false))
        game.addPlayer(player)
        instance["games"].push(game)
        socket.data.gameId = game.id

        const opponent = new SkyjoPlayer(
          "player2",
          "socketId132312",
          "elephant",
        )
        game.addPlayer(opponent)

        await expect(() => instance.onDiscardCard(socket)).rejects.toThrowError(
          ERROR.NOT_ALLOWED,
        )

        expect(socket.emit).not.toHaveBeenCalled()
      })

      it("should throw if it's not the player turn", async () => {
        const player = new SkyjoPlayer("player1", TEST_SOCKET_ID, "elephant")
        const game = new Skyjo(player, new SkyjoSettings(false))
        game.addPlayer(player)
        instance["games"].push(game)
        socket.data.gameId = game.id

        const opponent = new SkyjoPlayer(
          "player2",
          "socketId132312",
          "elephant",
        )
        game.addPlayer(opponent)

        game.start()

        opponent.turnCard(0, 0)
        opponent.turnCard(0, 1)
        player.turnCard(0, 0)
        player.turnCard(0, 1)
        game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)

        game.turn = 1

        await expect(() => instance.onDiscardCard(socket)).rejects.toThrowError(
          "not-your-turn",
        )

        expect(socket.emit).not.toHaveBeenCalled()
      })

      it("should throw if it's not the waited move", async () => {
        const player = new SkyjoPlayer("player1", TEST_SOCKET_ID, "elephant")
        const game = new Skyjo(player, new SkyjoSettings(false))
        socket.data.gameId = game.id
        game.addPlayer(player)
        instance["games"].push(game)
        const opponent = new SkyjoPlayer(
          "player2",
          "socketId132312",
          "elephant",
        )
        game.addPlayer(opponent)
        game.start()

        player.turnCard(0, 0)
        player.turnCard(0, 1)
        opponent.turnCard(0, 0)
        opponent.turnCard(0, 1)

        game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)
        game.turn = 0
        game.turnState = "chooseAPile"
        game.selectedCard = new SkyjoCard(0, true)

        await expect(() => instance.onDiscardCard(socket)).rejects.toThrowError(
          ERROR.INVALID_TURN_STATE,
        )

        expect(socket.emit).not.toHaveBeenCalled()
      })

      it("should discard a card", async () => {
        const player = new SkyjoPlayer("player1", TEST_SOCKET_ID, "elephant")
        const game = new Skyjo(player, new SkyjoSettings(false))
        socket.data.gameId = game.id
        game.addPlayer(player)
        instance["games"].push(game)
        const opponent = new SkyjoPlayer(
          "player2",
          "socketId132312",
          "elephant",
        )
        game.addPlayer(opponent)
        game.start()

        player.turnCard(0, 0)
        player.turnCard(0, 1)
        opponent.turnCard(0, 0)
        opponent.turnCard(0, 1)

        game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)
        game.turn = 0
        game.turnState = "throwOrReplace"
        game.selectedCard = new SkyjoCard(0, true)

        await instance.onDiscardCard(socket)

        expect(game.selectedCard).toBeNull()
        expect(game.turn).toBe(0)
        expect(game.turnState).toBe<TurnState>("turnACard")
      })
    })

    describe("on turn card", () => {
      it("should throw if the game does not exist", async () => {
        socket.data.gameId = TEST_UNKNOWN_GAME_ID

        await expect(() =>
          instance.onTurnCard(socket, { column: 0, row: 0 }),
        ).rejects.toThrowError(ERROR.GAME_NOT_FOUND)
      })

      it("should throw if player is not in the game", async () => {
        const opponent = new SkyjoPlayer("player1", "socket456", "elephant")
        const game = new Skyjo(opponent, new SkyjoSettings(false))
        game.addPlayer(opponent)
        instance["games"].push(game)
        socket.data.gameId = game.id

        const opponent2 = new SkyjoPlayer(
          "opponent2",
          "socketId9887",
          "elephant",
        )
        game.addPlayer(opponent2)

        game.start()

        opponent.turnCard(0, 0)
        opponent.turnCard(0, 1)
        opponent2.turnCard(0, 0)
        opponent2.turnCard(0, 1)

        game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)
        game.turn = 0

        await expect(() =>
          instance.onTurnCard(socket, { column: 0, row: 2 }),
        ).rejects.toThrowError(ERROR.PLAYER_NOT_FOUND)

        expect(socket.emit).not.toHaveBeenCalled()
      })

      it("should throw if game is not started", async () => {
        const player = new SkyjoPlayer("player1", TEST_SOCKET_ID, "elephant")
        const game = new Skyjo(player, new SkyjoSettings(false))
        game.addPlayer(player)
        instance["games"].push(game)
        socket.data.gameId = game.id

        const opponent = new SkyjoPlayer(
          "player2",
          "socketId132312",
          "elephant",
        )
        game.addPlayer(opponent)

        await expect(() =>
          instance.onTurnCard(socket, { column: 0, row: 0 }),
        ).rejects.toThrowError(ERROR.NOT_ALLOWED)

        expect(socket.emit).not.toHaveBeenCalled()
      })

      it("should throw if it's not player turn", async () => {
        const player = new SkyjoPlayer("player1", TEST_SOCKET_ID, "elephant")
        const game = new Skyjo(player, new SkyjoSettings(false))
        game.addPlayer(player)
        instance["games"].push(game)
        socket.data.gameId = game.id

        const opponent = new SkyjoPlayer(
          "player2",
          "socketId132312",
          "elephant",
        )
        game.addPlayer(opponent)

        game.start()

        opponent.turnCard(0, 0)
        opponent.turnCard(0, 1)
        player.turnCard(0, 0)
        player.turnCard(0, 1)
        game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)

        game.turn = 1

        await expect(() =>
          instance.onTurnCard(socket, { column: 0, row: 2 }),
        ).rejects.toThrowError("not-your-turn")

        expect(socket.emit).not.toHaveBeenCalled()
      })

      it("should throw if it's not the waited move", async () => {
        const player = new SkyjoPlayer("player1", TEST_SOCKET_ID, "elephant")
        const game = new Skyjo(player, new SkyjoSettings(false))
        socket.data.gameId = game.id
        game.addPlayer(player)
        instance["games"].push(game)
        const opponent = new SkyjoPlayer(
          "player2",
          "socketId132312",
          "elephant",
        )
        game.addPlayer(opponent)
        game.start()

        player.turnCard(0, 0)
        player.turnCard(0, 1)
        opponent.turnCard(0, 0)
        opponent.turnCard(0, 1)

        game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)
        game.turn = 0
        game.turnState = "replaceACard"

        await expect(() =>
          instance.onTurnCard(socket, { column: 0, row: 2 }),
        ).rejects.toThrowError(ERROR.INVALID_TURN_STATE)

        expect(socket.emit).not.toHaveBeenCalled()
      })

      it("should turn a card and finish the turn ", async () => {
        const player = new SkyjoPlayer("player1", TEST_SOCKET_ID, "elephant")
        const game = new Skyjo(player, new SkyjoSettings(false))
        socket.data.gameId = game.id
        game.addPlayer(player)
        instance["games"].push(game)
        const opponent = new SkyjoPlayer(
          "player2",
          "socketId132312",
          "elephant",
        )
        game.addPlayer(opponent)
        game.start()

        player.turnCard(0, 0)
        player.turnCard(0, 1)
        opponent.turnCard(0, 0)
        opponent.turnCard(0, 1)

        game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)
        game.turn = 0
        game.turnState = "turnACard"

        await instance.onTurnCard(socket, { column: 0, row: 2 })

        expect(player.cards[0][2].isVisible).toBeTruthy()
        expect(game.turn).toBe(1)
        expect(game.turnState).toBe<TurnState>("chooseAPile")
      })

      it("should turn a card, finish the turn and start a new round", async () => {
        const player = new SkyjoPlayer("player1", TEST_SOCKET_ID, "elephant")
        const game = new Skyjo(player, new SkyjoSettings(false))
        socket.data.gameId = game.id
        game.addPlayer(player)
        instance["games"].push(game)
        const opponent = new SkyjoPlayer(
          "player2",
          "socketId132312",
          "elephant",
        )
        game.addPlayer(opponent)
        game.start()

        player.turnCard(0, 0)
        player.turnCard(0, 1)
        opponent.turnCard(0, 0)
        opponent.turnCard(0, 1)

        game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)

        opponent.cards = [
          [new SkyjoCard(1, true), new SkyjoCard(1, true)],
          [new SkyjoCard(1, true), new SkyjoCard(1, true)],
          [new SkyjoCard(1, true), new SkyjoCard(1, true)],
          [new SkyjoCard(1, true), new SkyjoCard(1, true)],
        ]

        game.turn = 0
        game.roundNumber = 1
        game.firstPlayerToFinish = opponent
        game.turnState = "turnACard"
        game.roundState = "lastLap"

        await instance.onTurnCard(socket, { column: 0, row: 2 })

        expect(game.roundState).toBe<RoundState>("over")
        expect(game.status).toBe<GameStatus>("playing")
      })
    })
  })

  describe("on replay", () => {
    it("should throw if it does not exist", async () => {
      socket.data.gameId = TEST_UNKNOWN_GAME_ID

      await expect(() => instance.onReplay(socket)).rejects.toThrowError(
        ERROR.GAME_NOT_FOUND,
      )

      expect(socket.emit).not.toHaveBeenCalled()
    })

    it("should throw if the game is not finished", async () => {
      const player = new SkyjoPlayer("player1", TEST_SOCKET_ID, "elephant")
      const game = new Skyjo(player, new SkyjoSettings(false))
      game.addPlayer(player)
      instance["games"].push(game)
      socket.data.gameId = game.id

      const opponent = new SkyjoPlayer("player2", "socketId132312", "elephant")
      game.addPlayer(opponent)
      game.start()

      player.turnCard(0, 0)
      player.turnCard(0, 1)
      opponent.turnCard(0, 0)
      opponent.turnCard(0, 1)

      game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)
      game.turn = 0
      game.turnState = "chooseAPile"

      await expect(() => instance.onReplay(socket)).rejects.toThrowError(
        ERROR.NOT_ALLOWED,
      )

      expect(socket.emit).not.toHaveBeenCalled()
    })

    it("should ask to replay the game but not restart it", async () => {
      const player = new SkyjoPlayer("player1", TEST_SOCKET_ID, "elephant")
      const game = new Skyjo(player, new SkyjoSettings(false))
      game.addPlayer(player)
      instance["games"].push(game)
      socket.data.gameId = game.id

      const opponent = new SkyjoPlayer("player2", "socketId132312", "elephant")
      game.addPlayer(opponent)
      game.start()

      player.turnCard(0, 0)
      player.turnCard(0, 1)
      opponent.turnCard(0, 0)
      opponent.turnCard(0, 1)

      game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)
      game.status = "finished"

      await instance.onReplay(socket)

      expect(socket.emit).toHaveBeenCalledOnce()
      expect(player.wantReplay).toBeTruthy()
      expect(game.status).toBe<GameStatus>("finished")
    })

    it("should ask to replay the game and restart it", async () => {
      const player = new SkyjoPlayer("player1", TEST_SOCKET_ID, "elephant")
      const game = new Skyjo(player, new SkyjoSettings(false))
      game.addPlayer(player)
      instance["games"].push(game)
      socket.data.gameId = game.id

      const opponent = new SkyjoPlayer("player2", "socketId132312", "elephant")
      game.addPlayer(opponent)
      game.start()

      player.turnCard(0, 0)
      player.turnCard(0, 1)
      opponent.turnCard(0, 0)
      opponent.turnCard(0, 1)

      game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)
      game.status = "finished"

      opponent.wantReplay = true

      await instance.onReplay(socket)

      expect(socket.emit).toHaveBeenCalledOnce()
      game.players.forEach((player) => {
        expect(player.wantReplay).toBeFalsy()
      })
      expect(game.status).toBe<GameStatus>("lobby")
    })
  })

  describe("on connection lost", () => {
    it("should do nothing if player is not in a game", async () => {
      socket.data.gameId = TEST_UNKNOWN_GAME_ID

      await instance.onConnectionLost(socket)

      expect(socket.emit).not.toHaveBeenCalled()
    })

    it("should set the player to connection lost", async () => {
      const player = new SkyjoPlayer("player1", TEST_SOCKET_ID, "elephant")
      const game = new Skyjo(player, new SkyjoSettings(false))
      game.addPlayer(player)
      instance["games"].push(game)
      socket.data.gameId = game.id

      const opponent = new SkyjoPlayer("player2", "socketId132312", "elephant")
      game.addPlayer(opponent)
      game.start()

      player.turnCard(0, 0)
      player.turnCard(0, 1)
      opponent.turnCard(0, 0)
      opponent.turnCard(0, 1)

      game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)

      await instance.onConnectionLost(socket)

      expect(player.connectionStatus).toBe<ConnectionStatus>("connection-lost")
    })
  })

  describe("on reconnect", () => {
    it("should throw if player is not in a game", async () => {
      socket.data.gameId = TEST_UNKNOWN_GAME_ID

      await expect(() => instance.onReconnect(socket)).rejects.toThrowError(
        ERROR.GAME_NOT_FOUND,
      )

      expect(socket.emit).not.toHaveBeenCalled()
    })

    it("should throw if player is not in the game", async () => {
      const opponent = new SkyjoPlayer("player2", "socketId132312", "elephant")
      const game = new Skyjo(opponent, new SkyjoSettings(false))
      game.addPlayer(opponent)
      instance["games"].push(game)
      socket.data.gameId = game.id

      const opponent2 = new SkyjoPlayer("opponent2", "socketId9887", "elephant")
      game.addPlayer(opponent2)
      game.start()

      await expect(() => instance.onReconnect(socket)).rejects.toThrowError(
        ERROR.PLAYER_NOT_FOUND,
      )
    })

    it("should reconnect the player", async () => {
      const player = new SkyjoPlayer("player1", TEST_SOCKET_ID, "elephant")
      const game = new Skyjo(player, new SkyjoSettings(false))
      game.addPlayer(player)
      instance["games"].push(game)
      socket.data.gameId = game.id

      const opponent = new SkyjoPlayer("player2", "socketId132312", "elephant")
      game.addPlayer(opponent)
      game.start()

      player.turnCard(0, 0)
      player.turnCard(0, 1)
      opponent.turnCard(0, 0)
      opponent.turnCard(0, 1)

      game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)

      player.connectionStatus = "disconnected"

      await instance.onReconnect(socket)

      expect(player.connectionStatus).toBe<ConnectionStatus>("connected")
      expect(socket.emit).toHaveBeenCalledOnce()
    })
  })

  describe("on leave", () => {
    it("should do nothing if player is not in a game", async () => {
      socket.data.gameId = TEST_UNKNOWN_GAME_ID

      await instance.onLeave(socket)

      expect(socket.emit).not.toHaveBeenCalled()
    })

    it("should throw if player is not in the game", async () => {
      const opponent = new SkyjoPlayer("player2", "socketId132312", "elephant")
      const game = new Skyjo(opponent, new SkyjoSettings(false))
      game.addPlayer(opponent)
      instance["games"].push(game)
      socket.data.gameId = game.id

      const opponent2 = new SkyjoPlayer("opponent2", "socketId9887", "elephant")
      game.addPlayer(opponent2)
      game.start()

      await expect(() => instance.onLeave(socket)).rejects.toThrowError(
        ERROR.PLAYER_NOT_FOUND,
      )
    })

    it("should remove the player from the game and stop the game", async () => {
      const opponent = new SkyjoPlayer("player1", "socket456", "elephant")
      const game = new Skyjo(opponent, new SkyjoSettings(false))
      game.addPlayer(opponent)
      instance["games"].push(game)
      socket.data.gameId = game.id

      const player = new SkyjoPlayer("player2", TEST_SOCKET_ID, "elephant")
      game.addPlayer(player)
      game.start()

      player.turnCard(0, 0)
      player.turnCard(0, 1)
      opponent.turnCard(0, 0)
      opponent.turnCard(0, 1)

      game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)

      await instance.onLeave(socket)

      expect(player.connectionStatus).toBe<ConnectionStatus>("disconnected")
      expect(game.status).toBe<GameStatus>("stopped")
      expect(game.players.length).toBe(1)
    })

    it("should disconnect the player, not stop the game, change turn and change the admin", async () => {
      const player = new SkyjoPlayer("player2", TEST_SOCKET_ID, "elephant")
      const game = new Skyjo(player, new SkyjoSettings(false))
      game.addPlayer(player)
      instance["games"].push(game)
      socket.data.gameId = game.id

      const opponent = new SkyjoPlayer("player1", "socket456", "elephant")
      game.addPlayer(opponent)

      const opponent2 = new SkyjoPlayer("opponent2", "socketId9887", "elephant")
      game.addPlayer(opponent2)

      game.start()

      player.turnCard(0, 0)
      player.turnCard(0, 1)
      opponent.turnCard(0, 0)
      opponent.turnCard(0, 1)
      opponent2.turnCard(0, 0)
      opponent2.turnCard(0, 1)

      game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)

      game.turn = 0

      await instance.onLeave(socket)

      expect(player.connectionStatus).toBe<ConnectionStatus>("disconnected")
      expect(game.status).toBe<GameStatus>("playing")
      expect(game.players.length).toBe(3)
      expect(game.turn).toBe(1)
    })

    it("should disconnect the player, change status of the game to playing", async () => {
      const opponent = new SkyjoPlayer("player1", "socket456", "elephant")
      const game = new Skyjo(opponent, new SkyjoSettings(false))
      game.addPlayer(opponent)

      instance["games"].push(game)
      socket.data.gameId = game.id

      const player = new SkyjoPlayer("player2", TEST_SOCKET_ID, "elephant")
      game.addPlayer(player)

      const opponent2 = new SkyjoPlayer("opponent2", "socketId9887", "elephant")
      game.addPlayer(opponent2)

      game.start()

      player.cards[0][0] = new SkyjoCard(11)
      player.cards[0][0] = new SkyjoCard(11)

      opponent.cards[0][0] = new SkyjoCard(12)
      opponent.cards[0][1] = new SkyjoCard(12)

      opponent2.cards[0][0] = new SkyjoCard(11)
      opponent2.cards[0][1] = new SkyjoCard(11)

      opponent.turnCard(0, 0)
      opponent.turnCard(0, 1)
      opponent2.turnCard(0, 0)
      opponent2.turnCard(0, 1)

      await instance.onLeave(socket)

      expect(player.connectionStatus).toBe<ConnectionStatus>("disconnected")
      expect(game.status).toBe<GameStatus>("playing")
      expect(game.players.length).toBe(3)
    })

    it("should disconnect the player and remove the game if there is no more player", async () => {
      const player = new SkyjoPlayer("player1", TEST_SOCKET_ID, "elephant")
      const game = new Skyjo(player, new SkyjoSettings(false))
      game.addPlayer(player)
      socket.data.gameId = game.id
      instance["games"].push(game)

      await instance.onLeave(socket)

      expect(game.status).toBe<GameStatus>("lobby")
      expect(game.players.length).toBe(0)
    })
  })

  describe("on message", () => {
    it("should throw if game does not exist", async () => {
      socket.data.gameId = TEST_UNKNOWN_GAME_ID

      await expect(() =>
        instance.onMessage(socket, { username: "player1", message: "Hello!" }),
      ).rejects.toThrowError(ERROR.GAME_NOT_FOUND)

      expect(socket.emit).not.toHaveBeenCalled()
    })

    it("should throw if player is not in the game", async () => {
      const opponent = new SkyjoPlayer("player1", "socket456", "elephant")
      const game = new Skyjo(opponent, new SkyjoSettings(false))
      game.addPlayer(opponent)
      instance["games"].push(game)
      socket.data.gameId = game.id

      await expect(() =>
        instance.onMessage(socket, { username: "player2", message: "Hello!" }),
      ).rejects.toThrowError(ERROR.PLAYER_NOT_FOUND)

      expect(socket.emit).not.toHaveBeenCalled()
    })

    it("should send a message", async () => {
      const player = new SkyjoPlayer("player1", TEST_SOCKET_ID, "elephant")
      const game = new Skyjo(player, new SkyjoSettings(false))
      game.addPlayer(player)
      instance["games"].push(game)
      socket.data.gameId = game.id

      const opponent = new SkyjoPlayer("player2", "socketId132312", "elephant")
      game.addPlayer(opponent)

      await instance.onMessage(socket, {
        username: "player2",
        message: "Hello!",
      })

      expect(socket.emit).toHaveBeenCalledOnce()
    })
  })
})
