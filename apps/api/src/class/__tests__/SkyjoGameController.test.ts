// import { Skyjo } from "@/class/Skyjo"
// import { SkyjoCard } from "@/class/SkyjoCard"
// import SkyjoGameController from "@/class/SkyjoGameController"
// import { SkyjoPlayer } from "@/class/SkyjoPlayer"
// import { SkyjoSettings } from "@/class/SkyjoSettings"
// import { GameService } from "@/database/game.service"
// import { PlayerService } from "@/database/player.service"
// import { SkyjoSocket } from "@/types/skyjoSocket"
// import {
//   AVATARS,
//   CONNECTION_STATUS,
//   ConnectionStatus,
//   ERROR,
//   GAME_STATUS,
//   GameStatus,
//   ROUND_STATUS,
//   RoundStatus,
//   SERVER_MESSAGE_TYPE,
//   TURN_STATUS,
//   TurnStatus,
// } from "shared/constants"
// import { ChangeSettings } from "shared/validations/changeSettings"
// import { CreatePlayer } from "shared/validations/player"
// import { LastGame } from "shared/validations/reconnect"
// import { beforeEach, describe, expect, it, vi } from "vitest"
// import { TEST_SOCKET_ID, TEST_UNKNOWN_GAME_ID } from "../../../__tests__/constants"

// vi.mock("database/provider", async (importActual) => {
//   return {
//     db: vi.fn(),
//   }
// })

// describe("Skyjo", () => {
//   let instance: SkyjoGameController
//   let socket: SkyjoSocket
//   beforeEach(() => {
//     // mock SkyjoGameController constructor
//     instance = SkyjoGameController.getInstance(true)
//     instance["playerService"] = mockPlayerService()
//     instance["gameService"] = mockGameService()
//     instance["games"] = []

//     socket = {
//       emit: vi.fn(),
//       on: vi.fn(),
//       join: vi.fn(),
//       to: vi.fn(() => ({ emit: vi.fn() })),
//       leave: vi.fn(),
//       data: {},
//       id: TEST_SOCKET_ID,
//       connected: true,
//       disconnected: false,
//       recovered: true,
//     } as any
//   })

//   describe("getInstance", () => {
//     it("should create and return the instance", () => {
//       const instance = SkyjoGameController.getInstance()
//       expect(SkyjoGameController.getInstance()).toBe(instance)
//     })

//     it("should return the instance", () => {
//       expect(SkyjoGameController.getInstance()).toBe(instance)
//     })
//   })

//   it("should create a new game", async () => {
//     const player: CreatePlayer = {
//       username: "player1",
//       avatar: AVATARS.BEE,
//     }

//     await instance.onCreate(socket, player)

//     const gameCode = socket.data.gameCode
//     const game = await instance["getGame"](gameCode)

//     expect(gameCode).toBeDefined()
//     expect(socket.emit).toHaveBeenNthCalledWith(
//       1,
//       "join",
//       game?.toJson(),
//       game.players[0].id,
//     )
//     expect(socket.emit).toHaveBeenNthCalledWith(
//       2,
//       "message:server",
//       expect.objectContaining({
//         type: SERVER_MESSAGE_TYPE.PLAYER_JOINED,
//         username: "player1",
//       }),
//     )
//     expect(socket.emit).toHaveBeenNthCalledWith(
//       3,
//       "game",
//       expect.objectContaining({ code: gameCode }),
//     )
//   })

//   describe("on get", () => {
//     it("should not get a game if it does not exist", async () => {
//       socket.data.gameCode = TEST_UNKNOWN_GAME_ID

//       await expect(() => instance.onGet(socket)).rejects.toThrowError(
//         ERROR.GAME_NOT_FOUND,
//       )

//       expect(socket.emit).not.toHaveBeenCalled()
//     })

//     it("should return the game", async () => {
//       const player: CreatePlayer = {
//         username: "player1",
//         avatar: AVATARS.BEE,
//       }

//       await instance.onCreate(socket, player)

//       const gameCode = socket.data.gameCode
//       await instance.onGet(socket)
//       const game = await instance["getGame"](gameCode)

//       expect(gameCode).toBeDefined()
//       expect(socket.emit).toHaveBeenNthCalledWith(
//         1,
//         "join",
//         game?.toJson(),
//         game.players[0].id,
//       )
//       expect(socket.emit).toHaveBeenNthCalledWith(
//         2,
//         "message:server",
//         expect.objectContaining({
//           type: SERVER_MESSAGE_TYPE.PLAYER_JOINED,
//           username: "player1",
//         }),
//       )
//       expect(socket.emit).toHaveBeenNthCalledWith(
//         3,
//         "game",
//         expect.objectContaining({ code: gameCode }),
//       )
//     })
//   })

//   describe("on find", () => {
//     it("should either create a new game or join an existing one", async () => {
//       const player: CreatePlayer = {
//         username: "player1",
//         avatar: AVATARS.BEE,
//       }

//       // Create a public game that might be joined
//       const existingGame = new Skyjo(
//         "existingPlayerId",
//         new SkyjoSettings(false),
//       )
//       existingGame.addPlayer(
//         new SkyjoPlayer(
//           { username: "existingPlayer", avatar: AVATARS.ELEPHANT },
//           "existingSocketId",
//         ),
//       )
//       instance["games"].push(existingGame)

//       await instance.onFind(socket, player)

//       const gameCode = socket.data.gameCode
//       const game = await instance["getGame"](gameCode)

//       expect(gameCode).toBeDefined()
//       expect(game).toBeDefined()
//       expect(game.players.length).toBeGreaterThanOrEqual(1)
//       expect(game.players.length).toBeLessThanOrEqual(2)

//       if (game.players.length === 1) {
//         // New game was created
//         expect(socket.emit).toHaveBeenNthCalledWith(
//           1,
//           "join",
//           game?.toJson(),
//           game.players[0].id,
//         )
//       } else {
//         // Joined existing game
//         expect(socket.emit).toHaveBeenNthCalledWith(
//           1,
//           "join",
//           game?.toJson(),
//           game.players[1].id,
//         )
//       }

//       expect(socket.emit).toHaveBeenNthCalledWith(
//         2,
//         "message:server",
//         expect.objectContaining({
//           type: SERVER_MESSAGE_TYPE.PLAYER_JOINED,
//           username: "player1",
//         }),
//       )
//       expect(socket.emit).toHaveBeenNthCalledWith(
//         3,
//         "game",
//         expect.objectContaining({ code: gameCode }),
//       )
//     })

//     it("should create a new game if no eligible games exist", async () => {
//       const player: CreatePlayer = {
//         username: "player1",
//         avatar: AVATARS.BEE,
//       }

//       // Ensure there are no eligible games
//       instance["games"] = []

//       await instance.onFind(socket, player)

//       const gameCode = socket.data.gameCode
//       const game = await instance["getGame"](gameCode)

//       expect(gameCode).toBeDefined()
//       expect(game.players.length).toBe(1)
//       expect(socket.emit).toHaveBeenNthCalledWith(
//         1,
//         "join",
//         game?.toJson(),
//         game.players[0].id,
//       )
//       expect(socket.emit).toHaveBeenNthCalledWith(
//         2,
//         "message:server",
//         expect.objectContaining({
//           type: SERVER_MESSAGE_TYPE.PLAYER_JOINED,
//           username: "player1",
//         }),
//       )
//       expect(socket.emit).toHaveBeenNthCalledWith(
//         3,
//         "game",
//         expect.objectContaining({ code: gameCode }),
//       )
//     })
//   })

//   describe("on join", () => {
//     it("should throw if it does not exist", async () => {
//       socket.data.gameCode = TEST_UNKNOWN_GAME_ID
//       const player: CreatePlayer = {
//         username: "player1",
//         avatar: AVATARS.BEE,
//       }

//       await expect(() =>
//         instance.onJoin(socket, TEST_UNKNOWN_GAME_ID, player),
//       ).rejects.toThrowError(ERROR.GAME_NOT_FOUND)

//       expect(socket.emit).not.toHaveBeenCalled()
//     })

//     it("should throw if it's full", async () => {
//       const opponent = new SkyjoPlayer(
//         { username: "player1", avatar: AVATARS.ELEPHANT },
//         "socket456",
//       )
//       const opponent2 = new SkyjoPlayer(
//         { username: "player2", avatar: AVATARS.ELEPHANT },
//         "socket456",
//       )

//       const game = new Skyjo(opponent.id, new SkyjoSettings(false))
//       game.settings.maxPlayers = 2
//       instance["games"].push(game)

//       game.addPlayer(opponent)
//       game.addPlayer(opponent2)

//       const player: CreatePlayer = {
//         username: "player2",
//         avatar: AVATARS.BEE,
//       }

//       await expect(() =>
//         instance.onJoin(socket, game.code, player),
//       ).rejects.toThrowError(ERROR.GAME_IS_FULL)

//       expect(socket.emit).not.toHaveBeenCalled()
//     })

//     it("sould throw if game already started", async () => {
//       const opponent = new SkyjoPlayer(
//         { username: "player1", avatar: AVATARS.ELEPHANT },
//         "socket456",
//       )
//       const opponent2 = new SkyjoPlayer(
//         { username: "player2", avatar: AVATARS.ELEPHANT },
//         "socket456",
//       )

//       const game = new Skyjo(opponent.id, new SkyjoSettings(false))
//       instance["games"].push(game)

//       game.addPlayer(opponent)
//       game.addPlayer(opponent2)

//       game.start()

//       const player: CreatePlayer = {
//         username: "player2",
//         avatar: AVATARS.BEE,
//       }

//       await expect(() =>
//         instance.onJoin(socket, game.code, player),
//       ).rejects.toThrowError(ERROR.GAME_ALREADY_STARTED)

//       expect(socket.emit).not.toHaveBeenCalled()
//     })

//     it("should join the game", async () => {
//       const opponent = new SkyjoPlayer(
//         { username: "player1", avatar: AVATARS.ELEPHANT },
//         "socket456",
//       )

//       const game = new Skyjo(opponent.id, new SkyjoSettings(false))
//       instance["games"].push(game)

//       game.addPlayer(opponent)

//       const player: CreatePlayer = {
//         username: "player2",
//         avatar: AVATARS.BEE,
//       }

//       await instance.onJoin(socket, game.code, player)

//       expect(game.players.length).toBe(2)
//       expect(socket.emit).toHaveBeenNthCalledWith(
//         1,
//         "join",
//         game?.toJson(),
//         game.players[1].id,
//       )
//       expect(socket.emit).toHaveBeenNthCalledWith(
//         2,
//         "message:server",
//         expect.objectContaining({
//           type: SERVER_MESSAGE_TYPE.PLAYER_JOINED,
//           username: "player2",
//         }),
//       )
//       expect(socket.emit).toHaveBeenNthCalledWith(
//         3,
//         "game",
//         expect.objectContaining({ code: game.code }),
//       )
//     })
//   })

//   describe("on settings change", () => {
//     it("should throw if no game is found", async () => {
//       socket.data.gameCode = TEST_UNKNOWN_GAME_ID

//       const newSettings: ChangeSettings = {
//         private: false,
//         allowSkyjoForColumn: true,
//         allowSkyjoForRow: true,
//         initialTurnedCount: 2,
//         cardPerRow: 6,
//         cardPerColumn: 8,
//         scoreToEndGame: 100,
//         multiplierForFirstPlayer: 2,
//       }

//       await expect(() =>
//         instance.onSettingsChange(socket, newSettings),
//       ).rejects.toThrowError(ERROR.GAME_NOT_FOUND)

//       expect(socket.emit).not.toHaveBeenCalled()
//     })
//     it("should throw if user is not admin", async () => {
//       const opponent = new SkyjoPlayer(
//         { username: "player1", avatar: AVATARS.ELEPHANT },
//         "socket456",
//       )

//       const game = new Skyjo(opponent.id, new SkyjoSettings(false))
//       instance["games"].push(game)

//       game.addPlayer(opponent)

//       const player = new SkyjoPlayer(
//         { username: "player1", avatar: AVATARS.PENGUIN },
//         TEST_SOCKET_ID,
//       )
//       game.addPlayer(player)
//       socket.data.gameCode = game.code
//       socket.data.playerId = player.id

//       const newSettings: ChangeSettings = {
//         private: false,
//         allowSkyjoForColumn: true,
//         allowSkyjoForRow: true,
//         initialTurnedCount: 2,
//         cardPerRow: 6,
//         cardPerColumn: 8,
//         scoreToEndGame: 100,
//         multiplierForFirstPlayer: 2,
//       }
//       await expect(() =>
//         instance.onSettingsChange(socket, newSettings),
//       ).rejects.toThrowError(ERROR.NOT_ALLOWED)

//       expect(socket.emit).not.toHaveBeenCalled()
//     })

//     it("should change the game settings", async () => {
//       const player = new SkyjoPlayer(
//         { username: "player1", avatar: AVATARS.PENGUIN },
//         TEST_SOCKET_ID,
//       )
//       const game = new Skyjo(player.id, new SkyjoSettings(false))
//       game.addPlayer(player)
//       instance["games"].push(game)
//       socket.data.gameCode = game.code
//       socket.data.playerId = player.id

//       const newSettings: ChangeSettings = {
//         private: true,
//         allowSkyjoForColumn: true,
//         allowSkyjoForRow: true,
//         initialTurnedCount: 2,
//         cardPerRow: 6,
//         cardPerColumn: 8,
//         scoreToEndGame: 100,
//         multiplierForFirstPlayer: 2,
//       }
//       await instance.onSettingsChange(socket, newSettings)

//       expect(game.settings).toBeInstanceOf(SkyjoSettings)
//       expect(game.settings.toJson()).toStrictEqual({
//         ...newSettings,
//         maxPlayers: 8,
//       })
//     })
//   })

//   describe("on game start", () => {
//     it("should throw if the game does not exist", async () => {
//       socket.data.gameCode = TEST_UNKNOWN_GAME_ID

//       await expect(() => instance.onGameStart(socket)).rejects.toThrowError(
//         ERROR.GAME_NOT_FOUND,
//       )

//       expect(socket.emit).not.toHaveBeenCalled()
//     })

//     it("should throw if player is not admin", async () => {
//       const opponent = new SkyjoPlayer(
//         { username: "player1", avatar: AVATARS.ELEPHANT },
//         "socket456",
//       )
//       const game = new Skyjo(opponent.id, new SkyjoSettings(false))
//       game.addPlayer(opponent)

//       instance["games"].push(game)

//       const player = new SkyjoPlayer(
//         { username: "player1", avatar: AVATARS.PENGUIN },
//         TEST_SOCKET_ID,
//       )
//       game.addPlayer(player)
//       socket.data.gameCode = game.code
//       socket.data.playerId = player.id

//       await expect(() => instance.onGameStart(socket)).rejects.toThrowError(
//         ERROR.NOT_ALLOWED,
//       )

//       expect(socket.emit).not.toHaveBeenCalled()
//     })

//     it("should start the game", async () => {
//       const player = new SkyjoPlayer(
//         { username: "player1", avatar: AVATARS.PENGUIN },
//         TEST_SOCKET_ID,
//       )
//       const game = new Skyjo(player.id, new SkyjoSettings(false))
//       game.addPlayer(player)
//       instance["games"].push(game)
//       socket.data.gameCode = game.code
//       socket.data.playerId = player.id

//       const opponent = new SkyjoPlayer(
//         { username: "player2", avatar: AVATARS.ELEPHANT },
//         "socket456",
//       )
//       game.addPlayer(opponent)

//       await instance.onGameStart(socket)

//       expect(game.status).toBe<GameStatus>(GAME_STATUS.PLAYING)
//       expect(game.roundStatus).toBe<RoundStatus>(
//         ROUND_STATUS.WAITING_PLAYERS_TO_TURN_INITIAL_CARDS,
//       )
//     })
//   })

//   describe("game actions", () => {
//     describe("on reveal card", () => {
//       it("should throw if game does not exist", async () => {
//         socket.data.gameCode = TEST_UNKNOWN_GAME_ID

//         await expect(() =>
//           instance.onRevealCard(socket, { column: 0, row: 0 }),
//         ).rejects.toThrowError(ERROR.GAME_NOT_FOUND)

//         expect(socket.emit).not.toHaveBeenCalled()
//       })

//       it("should throw if player is not in the game", async () => {
//         const player = new SkyjoPlayer(
//           { username: "player1", avatar: AVATARS.PENGUIN },
//           "socket2131123",
//         )
//         const game = new Skyjo(player.id, new SkyjoSettings(false))
//         game.addPlayer(player)
//         socket.data.gameCode = game.code

//         instance["games"].push(game)

//         const opponent = new SkyjoPlayer(
//           { username: "player2", avatar: AVATARS.TURTLE },
//           "socketId132312",
//         )
//         game.addPlayer(opponent)

//         await expect(() =>
//           instance.onRevealCard(socket, { column: 0, row: 0 }),
//         ).rejects.toThrowError(ERROR.PLAYER_NOT_FOUND)

//         expect(socket.emit).not.toHaveBeenCalled()
//       })

//       it("should throw if game is not started", async () => {
//         const player = new SkyjoPlayer(
//           { username: "player1", avatar: AVATARS.PENGUIN },
//           TEST_SOCKET_ID,
//         )
//         const game = new Skyjo(player.id, new SkyjoSettings(false))
//         game.addPlayer(player)
//         instance["games"].push(game)
//         socket.data.gameCode = game.code
//         socket.data.playerId = player.id

//         const opponent = new SkyjoPlayer(
//           { username: "player2", avatar: AVATARS.ELEPHANT },
//           "socketId132312",
//         )
//         game.addPlayer(opponent)

//         await expect(() =>
//           instance.onRevealCard(socket, { column: 0, row: 0 }),
//         ).rejects.toThrowError(ERROR.NOT_ALLOWED)

//         expect(socket.emit).not.toHaveBeenCalled()
//       })

//       it("should not reveal the card if player already revealed the right card amount", async () => {
//         const player = new SkyjoPlayer(
//           { username: "player1", avatar: AVATARS.PENGUIN },
//           TEST_SOCKET_ID,
//         )
//         const game = new Skyjo(player.id, new SkyjoSettings(false))
//         game.addPlayer(player)
//         instance["games"].push(game)
//         const opponent = new SkyjoPlayer(
//           { username: "player2", avatar: AVATARS.ELEPHANT },
//           "socketId132312",
//         )
//         game.addPlayer(opponent)
//         game.start()
//         player.turnCard(0, 0)
//         player.turnCard(0, 1)

//         socket.data.gameCode = game.code
//         socket.data.playerId = player.id

//         instance.onRevealCard(socket, { column: 0, row: 2 })

//         expect(player.hasRevealedCardCount(2)).toBeTruthy()
//         expect(game.status).toBe<GameStatus>(GAME_STATUS.PLAYING)
//         expect(game.roundStatus).toBe<RoundStatus>(
//           ROUND_STATUS.WAITING_PLAYERS_TO_TURN_INITIAL_CARDS,
//         )
//       })

//       it("should reveal the card", async () => {
//         const player = new SkyjoPlayer(
//           { username: "player1", avatar: AVATARS.PENGUIN },
//           TEST_SOCKET_ID,
//         )
//         const game = new Skyjo(player.id, new SkyjoSettings(false))
//         instance["games"].push(game)
//         const opponent = new SkyjoPlayer(
//           { username: "player2", avatar: AVATARS.ELEPHANT },
//           "socketId132312",
//         )

//         game.addPlayer(opponent)

//         game.addPlayer(player)
//         socket.data.gameCode = game.code
//         socket.data.playerId = player.id

//         game.start()
//         player.turnCard(0, 0)

//         await instance.onRevealCard(socket, { column: 0, row: 2 })

//         expect(player.hasRevealedCardCount(2)).toBeTruthy()
//         expect(game.status).toBe<GameStatus>(GAME_STATUS.PLAYING)
//         expect(game.roundStatus).toBe<RoundStatus>(
//           ROUND_STATUS.WAITING_PLAYERS_TO_TURN_INITIAL_CARDS,
//         )
//       })
//     })

//     describe("on pick card", () => {
//       it("should throw if game does not exist", async () => {
//         socket.data.gameCode = TEST_UNKNOWN_GAME_ID

//         await expect(() =>
//           instance.onPickCard(socket, { pile: "draw" }),
//         ).rejects.toThrowError(ERROR.GAME_NOT_FOUND)

//         expect(socket.emit).not.toHaveBeenCalled()
//       })

//       it("should throw if player is not in the game", async () => {
//         const opponent = new SkyjoPlayer(
//           { username: "player1", avatar: AVATARS.ELEPHANT },
//           "socket456",
//         )
//         const game = new Skyjo(opponent.id, new SkyjoSettings(false))
//         game.addPlayer(opponent)

//         instance["games"].push(game)
//         socket.data.gameCode = game.code

//         const opponent2 = new SkyjoPlayer(
//           { username: "opponent2", avatar: AVATARS.ELEPHANT },
//           "socketId9887",
//         )
//         game.addPlayer(opponent2)

//         game.start()

//         opponent.turnCard(0, 0)
//         opponent.turnCard(0, 1)
//         opponent2.turnCard(0, 0)
//         opponent2.turnCard(0, 1)

//         game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)
//         game.turn = 0

//         await expect(() =>
//           instance.onPickCard(socket, { pile: "draw" }),
//         ).rejects.toThrowError(ERROR.PLAYER_NOT_FOUND)

//         expect(socket.emit).not.toHaveBeenCalled()
//       })

//       it("should throw if game is not started", async () => {
//         const player = new SkyjoPlayer(
//           { username: "player1", avatar: AVATARS.PENGUIN },
//           TEST_SOCKET_ID,
//         )
//         const game = new Skyjo(player.id, new SkyjoSettings(false))
//         game.addPlayer(player)
//         instance["games"].push(game)
//         socket.data.gameCode = game.code
//         socket.data.playerId = player.id

//         const opponent = new SkyjoPlayer(
//           { username: "player2", avatar: AVATARS.ELEPHANT },
//           "socketId132312",
//         )
//         game.addPlayer(opponent)

//         await expect(() =>
//           instance.onPickCard(socket, { pile: "draw" }),
//         ).rejects.toThrowError(ERROR.NOT_ALLOWED)

//         expect(socket.emit).not.toHaveBeenCalled()
//       })

//       it("should throw if it's not the player turn", async () => {
//         const player = new SkyjoPlayer(
//           { username: "player1", avatar: AVATARS.PENGUIN },
//           TEST_SOCKET_ID,
//         )
//         const game = new Skyjo(player.id, new SkyjoSettings(false))
//         game.addPlayer(player)
//         instance["games"].push(game)
//         socket.data.gameCode = game.code
//         socket.data.playerId = player.id

//         const opponent = new SkyjoPlayer(
//           { username: "player2", avatar: AVATARS.ELEPHANT },
//           "socketId132312",
//         )
//         game.addPlayer(opponent)

//         game.start()

//         opponent.turnCard(0, 0)
//         opponent.turnCard(0, 1)
//         player.turnCard(0, 0)
//         player.turnCard(0, 1)
//         game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)

//         game.turn = 1

//         await expect(() =>
//           instance.onPickCard(socket, { pile: "draw" }),
//         ).rejects.toThrowError("not-your-turn")

//         expect(socket.emit).not.toHaveBeenCalled()
//       })

//       it("should throw if it's not the waited move", async () => {
//         const player = new SkyjoPlayer(
//           { username: "player1", avatar: AVATARS.PENGUIN },
//           TEST_SOCKET_ID,
//         )
//         const game = new Skyjo(player.id, new SkyjoSettings(false))
//         socket.data.gameCode = game.code
//         socket.data.playerId = player.id
//         game.addPlayer(player)
//         instance["games"].push(game)
//         const opponent = new SkyjoPlayer(
//           { username: "player2", avatar: AVATARS.ELEPHANT },
//           "socketId132312",
//         )
//         game.addPlayer(opponent)
//         game.start()

//         player.turnCard(0, 0)
//         player.turnCard(0, 1)
//         opponent.turnCard(0, 0)
//         opponent.turnCard(0, 1)

//         game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)
//         game.turn = 0
//         game.turnStatus = TURN_STATUS.REPLACE_A_CARD

//         await expect(() =>
//           instance.onPickCard(socket, { pile: "draw" }),
//         ).rejects.toThrowError(ERROR.INVALID_TURN_STATE)

//         expect(socket.emit).not.toHaveBeenCalled()
//       })

//       it("should pick a card from the draw pile", async () => {
//         const player = new SkyjoPlayer(
//           { username: "player1", avatar: AVATARS.PENGUIN },
//           TEST_SOCKET_ID,
//         )
//         const game = new Skyjo(player.id, new SkyjoSettings(false))
//         socket.data.gameCode = game.code
//         socket.data.playerId = player.id
//         game.addPlayer(player)
//         instance["games"].push(game)

//         const opponent = new SkyjoPlayer(
//           { username: "player2", avatar: AVATARS.ELEPHANT },
//           "socketId132312",
//         )
//         game.addPlayer(opponent)

//         game.start()

//         player.turnCard(0, 0)
//         player.turnCard(0, 1)
//         opponent.turnCard(0, 0)
//         opponent.turnCard(0, 1)

//         game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)
//         game.turn = 0

//         await instance.onPickCard(socket, { pile: "draw" })

//         expect(game.selectedCardValue).not.toBeNull()
//         expect(game.turnStatus).toBe<TurnStatus>(TURN_STATUS.THROW_OR_REPLACE)
//       })

//       it("should pick a card from the discard pile", async () => {
//         const player = new SkyjoPlayer(
//           { username: "player1", avatar: AVATARS.PENGUIN },
//           TEST_SOCKET_ID,
//         )
//         const game = new Skyjo(player.id, new SkyjoSettings(false))
//         socket.data.gameCode = game.code
//         socket.data.playerId = player.id
//         game.addPlayer(player)
//         instance["games"].push(game)

//         const opponent = new SkyjoPlayer(
//           { username: "player2", avatar: AVATARS.ELEPHANT },
//           "socketId132312",
//         )
//         game.addPlayer(opponent)

//         game.start()

//         player.turnCard(0, 0)
//         player.turnCard(0, 1)
//         opponent.turnCard(0, 0)
//         opponent.turnCard(0, 1)

//         game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)
//         game.turn = 0

//         await instance.onPickCard(socket, { pile: "discard" })

//         expect(socket.emit).toHaveBeenCalledOnce()
//         expect(game.selectedCardValue).not.toBeNull()
//         expect(game.turnStatus).toBe<TurnStatus>(TURN_STATUS.REPLACE_A_CARD)
//       })
//     })

//     describe("on replace card", () => {
//       it("should throw if the game does not exist", async () => {
//         socket.data.gameCode = TEST_UNKNOWN_GAME_ID

//         await expect(() =>
//           instance.onReplaceCard(socket, { column: 0, row: 0 }),
//         ).rejects.toThrowError(ERROR.GAME_NOT_FOUND)

//         expect(socket.emit).not.toHaveBeenCalled()
//       })

//       it("should throw if player is not in the game", async () => {
//         const opponent = new SkyjoPlayer(
//           { username: "player1", avatar: AVATARS.ELEPHANT },
//           "socket456",
//         )
//         const game = new Skyjo(opponent.id, new SkyjoSettings(false))
//         game.addPlayer(opponent)

//         instance["games"].push(game)
//         socket.data.gameCode = game.code

//         const opponent2 = new SkyjoPlayer(
//           { username: "opponent2", avatar: AVATARS.ELEPHANT },
//           "socketId9887",
//         )
//         game.addPlayer(opponent2)

//         game.start()

//         opponent.turnCard(0, 0)
//         opponent.turnCard(0, 1)
//         opponent2.turnCard(0, 0)
//         opponent2.turnCard(0, 1)

//         game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)
//         game.turn = 0

//         await expect(() =>
//           instance.onReplaceCard(socket, { column: 0, row: 2 }),
//         ).rejects.toThrowError(ERROR.PLAYER_NOT_FOUND)

//         expect(socket.emit).not.toHaveBeenCalled()
//       })

//       it("should throw if game is not started", async () => {
//         const player = new SkyjoPlayer(
//           { username: "player1", avatar: AVATARS.PENGUIN },
//           TEST_SOCKET_ID,
//         )
//         const game = new Skyjo(player.id, new SkyjoSettings(false))
//         game.addPlayer(player)
//         instance["games"].push(game)
//         socket.data.gameCode = game.code
//         socket.data.playerId = player.id

//         const opponent = new SkyjoPlayer(
//           { username: "player2", avatar: AVATARS.ELEPHANT },
//           "socketId132312",
//         )
//         game.addPlayer(opponent)

//         await expect(() =>
//           instance.onReplaceCard(socket, { column: 0, row: 0 }),
//         ).rejects.toThrowError(ERROR.NOT_ALLOWED)

//         expect(socket.emit).not.toHaveBeenCalled()
//       })

//       it("should throw if it's not the player turn", async () => {
//         const player = new SkyjoPlayer(
//           { username: "player1", avatar: AVATARS.PENGUIN },
//           TEST_SOCKET_ID,
//         )
//         const game = new Skyjo(player.id, new SkyjoSettings(false))
//         game.addPlayer(player)
//         instance["games"].push(game)
//         socket.data.gameCode = game.code
//         socket.data.playerId = player.id

//         const opponent = new SkyjoPlayer(
//           { username: "player2", avatar: AVATARS.ELEPHANT },
//           "socketId132312",
//         )
//         game.addPlayer(opponent)

//         game.start()

//         opponent.turnCard(0, 0)
//         opponent.turnCard(0, 1)
//         player.turnCard(0, 0)
//         player.turnCard(0, 1)
//         game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)

//         game.turn = 1

//         await expect(() =>
//           instance.onReplaceCard(socket, { column: 0, row: 2 }),
//         ).rejects.toThrowError("not-your-turn")

//         expect(socket.emit).not.toHaveBeenCalled()
//       })

//       it("should throw if it's not the waited move", async () => {
//         const player = new SkyjoPlayer(
//           { username: "player1", avatar: AVATARS.PENGUIN },
//           TEST_SOCKET_ID,
//         )
//         const game = new Skyjo(player.id, new SkyjoSettings(false))
//         socket.data.gameCode = game.code
//         socket.data.playerId = player.id
//         game.addPlayer(player)
//         instance["games"].push(game)
//         const opponent = new SkyjoPlayer(
//           { username: "player2", avatar: AVATARS.ELEPHANT },
//           "socketId132312",
//         )
//         game.addPlayer(opponent)
//         game.start()

//         player.turnCard(0, 0)
//         player.turnCard(0, 1)
//         opponent.turnCard(0, 0)
//         opponent.turnCard(0, 1)

//         game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)
//         game.turn = 0
//         game.turnStatus = TURN_STATUS.CHOOSE_A_PILE

//         await expect(() =>
//           instance.onReplaceCard(socket, { column: 0, row: 2 }),
//         ).rejects.toThrowError(ERROR.INVALID_TURN_STATE)

//         expect(socket.emit).not.toHaveBeenCalled()
//       })

//       it("should replace a card and finish the turn", async () => {
//         const player = new SkyjoPlayer(
//           { username: "player1", avatar: AVATARS.PENGUIN },
//           TEST_SOCKET_ID,
//         )
//         const game = new Skyjo(player.id, new SkyjoSettings(false))
//         socket.data.gameCode = game.code
//         socket.data.playerId = player.id
//         game.addPlayer(player)
//         instance["games"].push(game)
//         const opponent = new SkyjoPlayer(
//           { username: "player2", avatar: AVATARS.ELEPHANT },
//           "socketId132312",
//         )
//         game.addPlayer(opponent)
//         game.start()

//         player.turnCard(0, 0)
//         player.turnCard(0, 1)
//         opponent.turnCard(0, 0)
//         opponent.turnCard(0, 1)

//         game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)
//         game.turn = 0
//         game.selectedCardValue = 0
//         game.turnStatus = TURN_STATUS.REPLACE_A_CARD

//         await instance.onReplaceCard(socket, { column: 0, row: 2 })

//         expect(socket.emit).toHaveBeenCalledTimes(2)
//         expect(game.selectedCardValue).toBeNull()
//         expect(game.turn).toBe(1)
//         expect(game.turnStatus).toBe<TurnStatus>(TURN_STATUS.CHOOSE_A_PILE)
//       })
//     })

//     describe("on discard card", () => {
//       it("should throw if the game does not exist", async () => {
//         socket.data.gameCode = TEST_UNKNOWN_GAME_ID

//         await expect(() => instance.onDiscardCard(socket)).rejects.toThrowError(
//           ERROR.GAME_NOT_FOUND,
//         )

//         expect(socket.emit).not.toHaveBeenCalled()
//       })

//       it("should throw if player is not in the game", async () => {
//         const opponent = new SkyjoPlayer(
//           { username: "player1", avatar: AVATARS.ELEPHANT },
//           "socket456",
//         )
//         const game = new Skyjo(opponent.id, new SkyjoSettings(false))
//         game.addPlayer(opponent)

//         instance["games"].push(game)
//         socket.data.gameCode = game.code

//         const opponent2 = new SkyjoPlayer(
//           { username: "opponent2", avatar: AVATARS.ELEPHANT },
//           "socketId9887",
//         )
//         game.addPlayer(opponent2)

//         game.start()

//         opponent.turnCard(0, 0)
//         opponent.turnCard(0, 1)
//         opponent2.turnCard(0, 0)
//         opponent2.turnCard(0, 1)

//         game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)
//         game.turn = 0

//         await expect(() => instance.onDiscardCard(socket)).rejects.toThrowError(
//           ERROR.PLAYER_NOT_FOUND,
//         )

//         expect(socket.emit).not.toHaveBeenCalled()
//       })

//       it("should throw if game is not started", async () => {
//         const player = new SkyjoPlayer(
//           { username: "player1", avatar: AVATARS.PENGUIN },
//           TEST_SOCKET_ID,
//         )
//         const game = new Skyjo(player.id, new SkyjoSettings(false))
//         game.addPlayer(player)
//         instance["games"].push(game)
//         socket.data.gameCode = game.code
//         socket.data.playerId = player.id

//         const opponent = new SkyjoPlayer(
//           { username: "player2", avatar: AVATARS.ELEPHANT },
//           "socketId132312",
//         )
//         game.addPlayer(opponent)

//         await expect(() => instance.onDiscardCard(socket)).rejects.toThrowError(
//           ERROR.NOT_ALLOWED,
//         )

//         expect(socket.emit).not.toHaveBeenCalled()
//       })

//       it("should throw if it's not the player turn", async () => {
//         const player = new SkyjoPlayer(
//           { username: "player1", avatar: AVATARS.PENGUIN },
//           TEST_SOCKET_ID,
//         )
//         const game = new Skyjo(player.id, new SkyjoSettings(false))
//         game.addPlayer(player)
//         instance["games"].push(game)
//         socket.data.gameCode = game.code
//         socket.data.playerId = player.id

//         const opponent = new SkyjoPlayer(
//           { username: "player2", avatar: AVATARS.ELEPHANT },
//           "socketId132312",
//         )
//         game.addPlayer(opponent)

//         game.start()

//         opponent.turnCard(0, 0)
//         opponent.turnCard(0, 1)
//         player.turnCard(0, 0)
//         player.turnCard(0, 1)
//         game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)

//         game.turn = 1

//         await expect(() => instance.onDiscardCard(socket)).rejects.toThrowError(
//           "not-your-turn",
//         )

//         expect(socket.emit).not.toHaveBeenCalled()
//       })

//       it("should throw if it's not the waited move", async () => {
//         const player = new SkyjoPlayer(
//           { username: "player1", avatar: AVATARS.PENGUIN },
//           TEST_SOCKET_ID,
//         )
//         const game = new Skyjo(player.id, new SkyjoSettings(false))
//         socket.data.gameCode = game.code
//         socket.data.playerId = player.id
//         game.addPlayer(player)
//         instance["games"].push(game)
//         const opponent = new SkyjoPlayer(
//           { username: "player2", avatar: AVATARS.ELEPHANT },
//           "socketId132312",
//         )
//         game.addPlayer(opponent)
//         game.start()

//         player.turnCard(0, 0)
//         player.turnCard(0, 1)
//         opponent.turnCard(0, 0)
//         opponent.turnCard(0, 1)

//         game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)
//         game.turn = 0
//         game.turnStatus = TURN_STATUS.CHOOSE_A_PILE
//         game.selectedCardValue = 0

//         await expect(() => instance.onDiscardCard(socket)).rejects.toThrowError(
//           ERROR.INVALID_TURN_STATE,
//         )

//         expect(socket.emit).not.toHaveBeenCalled()
//       })

//       it("should discard a card", async () => {
//         const player = new SkyjoPlayer(
//           { username: "player1", avatar: AVATARS.PENGUIN },
//           TEST_SOCKET_ID,
//         )
//         const game = new Skyjo(player.id, new SkyjoSettings(false))
//         socket.data.gameCode = game.code
//         socket.data.playerId = player.id
//         game.addPlayer(player)
//         instance["games"].push(game)
//         const opponent = new SkyjoPlayer(
//           { username: "player2", avatar: AVATARS.ELEPHANT },
//           "socketId132312",
//         )
//         game.addPlayer(opponent)
//         game.start()

//         player.turnCard(0, 0)
//         player.turnCard(0, 1)
//         opponent.turnCard(0, 0)
//         opponent.turnCard(0, 1)

//         game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)
//         game.turn = 0
//         game.turnStatus = TURN_STATUS.THROW_OR_REPLACE
//         game.selectedCardValue = 0

//         await instance.onDiscardCard(socket)

//         expect(game.selectedCardValue).toBeNull()
//         expect(game.turn).toBe(0)
//         expect(game.turnStatus).toBe<TurnStatus>(TURN_STATUS.TURN_A_CARD)
//       })
//     })

//     describe("on turn card", () => {
//       it("should throw if the game does not exist", async () => {
//         socket.data.gameCode = TEST_UNKNOWN_GAME_ID

//         await expect(() =>
//           instance.onTurnCard(socket, { column: 0, row: 0 }),
//         ).rejects.toThrowError(ERROR.GAME_NOT_FOUND)
//       })

//       it("should throw if player is not in the game", async () => {
//         const opponent = new SkyjoPlayer(
//           { username: "player1", avatar: AVATARS.ELEPHANT },
//           "socket456",
//         )
//         const game = new Skyjo(opponent.id, new SkyjoSettings(false))
//         game.addPlayer(opponent)

//         instance["games"].push(game)
//         socket.data.gameCode = game.code

//         const opponent2 = new SkyjoPlayer(
//           { username: "opponent2", avatar: AVATARS.ELEPHANT },
//           "socketId9887",
//         )
//         game.addPlayer(opponent2)

//         game.start()

//         opponent.turnCard(0, 0)
//         opponent.turnCard(0, 1)
//         opponent2.turnCard(0, 0)
//         opponent2.turnCard(0, 1)

//         game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)
//         game.turn = 0

//         await expect(() =>
//           instance.onTurnCard(socket, { column: 0, row: 2 }),
//         ).rejects.toThrowError(ERROR.PLAYER_NOT_FOUND)

//         expect(socket.emit).not.toHaveBeenCalled()
//       })

//       it("should throw if game is not started", async () => {
//         const player = new SkyjoPlayer(
//           { username: "player1", avatar: AVATARS.PENGUIN },
//           TEST_SOCKET_ID,
//         )
//         const game = new Skyjo(player.id, new SkyjoSettings(false))
//         game.addPlayer(player)
//         instance["games"].push(game)
//         socket.data.gameCode = game.code
//         socket.data.playerId = player.id

//         const opponent = new SkyjoPlayer(
//           { username: "player2", avatar: AVATARS.ELEPHANT },
//           "socketId132312",
//         )
//         game.addPlayer(opponent)

//         await expect(() =>
//           instance.onTurnCard(socket, { column: 0, row: 0 }),
//         ).rejects.toThrowError(ERROR.NOT_ALLOWED)

//         expect(socket.emit).not.toHaveBeenCalled()
//       })

//       it("should throw if it's not player turn", async () => {
//         const player = new SkyjoPlayer(
//           { username: "player1", avatar: AVATARS.PENGUIN },
//           TEST_SOCKET_ID,
//         )
//         const game = new Skyjo(player.id, new SkyjoSettings(false))
//         game.addPlayer(player)
//         instance["games"].push(game)
//         socket.data.gameCode = game.code
//         socket.data.playerId = player.id

//         const opponent = new SkyjoPlayer(
//           { username: "player2", avatar: AVATARS.ELEPHANT },
//           "socketId132312",
//         )
//         game.addPlayer(opponent)

//         game.start()

//         opponent.turnCard(0, 0)
//         opponent.turnCard(0, 1)
//         player.turnCard(0, 0)
//         player.turnCard(0, 1)
//         game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)

//         game.turn = 1

//         await expect(() =>
//           instance.onTurnCard(socket, { column: 0, row: 2 }),
//         ).rejects.toThrowError("not-your-turn")

//         expect(socket.emit).not.toHaveBeenCalled()
//       })

//       it("should throw if it's not the waited move", async () => {
//         const player = new SkyjoPlayer(
//           { username: "player1", avatar: AVATARS.PENGUIN },
//           TEST_SOCKET_ID,
//         )
//         const game = new Skyjo(player.id, new SkyjoSettings(false))
//         socket.data.gameCode = game.code
//         socket.data.playerId = player.id
//         game.addPlayer(player)
//         instance["games"].push(game)
//         const opponent = new SkyjoPlayer(
//           { username: "player2", avatar: AVATARS.ELEPHANT },
//           "socketId132312",
//         )
//         game.addPlayer(opponent)
//         game.start()

//         player.turnCard(0, 0)
//         player.turnCard(0, 1)
//         opponent.turnCard(0, 0)
//         opponent.turnCard(0, 1)

//         game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)
//         game.turn = 0
//         game.turnStatus = TURN_STATUS.REPLACE_A_CARD

//         await expect(() =>
//           instance.onTurnCard(socket, { column: 0, row: 2 }),
//         ).rejects.toThrowError(ERROR.INVALID_TURN_STATE)

//         expect(socket.emit).not.toHaveBeenCalled()
//       })

//       it("should turn a card and finish the turn ", async () => {
//         const player = new SkyjoPlayer(
//           { username: "player1", avatar: AVATARS.PENGUIN },
//           TEST_SOCKET_ID,
//         )
//         const game = new Skyjo(player.id, new SkyjoSettings(false))
//         socket.data.gameCode = game.code
//         socket.data.playerId = player.id
//         game.addPlayer(player)
//         instance["games"].push(game)
//         const opponent = new SkyjoPlayer(
//           { username: "player2", avatar: AVATARS.ELEPHANT },
//           "socketId132312",
//         )
//         game.addPlayer(opponent)
//         game.start()

//         player.turnCard(0, 0)
//         player.turnCard(0, 1)
//         opponent.turnCard(0, 0)
//         opponent.turnCard(0, 1)

//         game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)
//         game.turn = 0
//         game.turnStatus = TURN_STATUS.TURN_A_CARD

//         await instance.onTurnCard(socket, { column: 0, row: 2 })

//         expect(player.cards[0][2].isVisible).toBeTruthy()
//         expect(game.turn).toBe(1)
//         expect(game.turnStatus).toBe<TurnStatus>(TURN_STATUS.CHOOSE_A_PILE)
//       })

//       it("should turn a card, finish the turn and start a new round", async () => {
//         vi.useFakeTimers()
//         const player = new SkyjoPlayer(
//           { username: "player1", avatar: AVATARS.PENGUIN },
//           TEST_SOCKET_ID,
//         )
//         const game = new Skyjo(player.id, new SkyjoSettings(false))
//         socket.data.gameCode = game.code
//         socket.data.playerId = player.id
//         game.addPlayer(player)
//         instance["games"].push(game)
//         const opponent = new SkyjoPlayer(
//           { username: "player2", avatar: AVATARS.ELEPHANT },
//           "socketId132312",
//         )
//         game.addPlayer(opponent)
//         game.start()

//         player.turnCard(0, 0)
//         player.turnCard(0, 1)
//         opponent.turnCard(0, 0)
//         opponent.turnCard(0, 1)

//         game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)

//         opponent.cards = [
//           [new SkyjoCard(1, true), new SkyjoCard(1, true)],
//           [new SkyjoCard(1, true), new SkyjoCard(1, true)],
//           [new SkyjoCard(1, true), new SkyjoCard(1, true)],
//           [new SkyjoCard(1, true), new SkyjoCard(1, true)],
//         ]

//         game.turn = 0
//         game.roundNumber = 1
//         game.firstToFinishPlayerId = opponent.id
//         opponent.hasPlayedLastTurn = true
//         game.turnStatus = TURN_STATUS.TURN_A_CARD
//         game.roundStatus = ROUND_STATUS.LAST_LAP

//         await instance.onTurnCard(socket, { column: 0, row: 2 })

//         expect(game.roundStatus).toBe<RoundStatus>(ROUND_STATUS.OVER)
//         expect(game.status).toBe<GameStatus>(GAME_STATUS.PLAYING)

//         vi.runAllTimers()

//         expect(game.roundStatus).toBe<RoundStatus>(
//           ROUND_STATUS.WAITING_PLAYERS_TO_TURN_INITIAL_CARDS,
//         )
//         expect(game.status).toBe<GameStatus>(GAME_STATUS.PLAYING)

//         vi.useRealTimers()
//       })

//       it("should turn a card, finish the turn and start a new round when first player to finish is disconnected", async () => {
//         vi.useFakeTimers()
//         const player = new SkyjoPlayer(
//           { username: "player1", avatar: AVATARS.PENGUIN },
//           TEST_SOCKET_ID,
//         )
//         const game = new Skyjo(player.id, new SkyjoSettings(false))
//         instance["games"].push(game)

//         socket.data.gameCode = game.code
//         socket.data.playerId = player.id
//         game.addPlayer(player)

//         const opponent = new SkyjoPlayer(
//           { username: "player2", avatar: AVATARS.ELEPHANT },
//           "socketId132312",
//         )
//         game.addPlayer(opponent)

//         const opponent2 = new SkyjoPlayer(
//           { username: "player3", avatar: AVATARS.ELEPHANT },
//           "socketId113226",
//         )
//         game.addPlayer(opponent2)

//         game.start()

//         player.turnCard(0, 0)
//         player.turnCard(0, 1)
//         opponent.turnCard(0, 0)
//         opponent.turnCard(0, 1)

//         game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)

//         opponent.cards = [
//           [new SkyjoCard(1, true), new SkyjoCard(1, true)],
//           [new SkyjoCard(1, true), new SkyjoCard(1, true)],
//           [new SkyjoCard(1, true), new SkyjoCard(1, true)],
//           [new SkyjoCard(1, true), new SkyjoCard(1, true)],
//         ]

//         game.turn = 0
//         game.roundNumber = 1
//         game.firstToFinishPlayerId = opponent.id
//         opponent.connectionStatus = CONNECTION_STATUS.DISCONNECTED
//         opponent2.hasPlayedLastTurn = true
//         game.turnStatus = TURN_STATUS.TURN_A_CARD
//         game.roundStatus = ROUND_STATUS.LAST_LAP

//         await instance.onTurnCard(socket, { column: 0, row: 2 })

//         expect(game.roundStatus).toBe<RoundStatus>(ROUND_STATUS.OVER)
//         expect(game.status).toBe<GameStatus>(GAME_STATUS.PLAYING)

//         vi.runAllTimers()

//         expect(game.roundStatus).toBe<RoundStatus>(
//           ROUND_STATUS.WAITING_PLAYERS_TO_TURN_INITIAL_CARDS,
//         )
//         expect(game.status).toBe<GameStatus>(GAME_STATUS.PLAYING)

//         vi.useRealTimers()
//       })
//     })
//   })

//   describe("on replay", () => {
//     it("should throw if it does not exist", async () => {
//       socket.data.gameCode = TEST_UNKNOWN_GAME_ID

//       await expect(() => instance.onReplay(socket)).rejects.toThrowError(
//         ERROR.GAME_NOT_FOUND,
//       )

//       expect(socket.emit).not.toHaveBeenCalled()
//     })

//     it("should throw if the game is not finished", async () => {
//       const player = new SkyjoPlayer(
//         { username: "player1", avatar: AVATARS.PENGUIN },
//         TEST_SOCKET_ID,
//       )
//       const game = new Skyjo(player.id, new SkyjoSettings(false))
//       game.addPlayer(player)
//       instance["games"].push(game)
//       socket.data.gameCode = game.code
//       socket.data.playerId = player.id

//       const opponent = new SkyjoPlayer(
//         { username: "player2", avatar: AVATARS.ELEPHANT },
//         "socketId132312",
//       )
//       game.addPlayer(opponent)
//       game.start()

//       player.turnCard(0, 0)
//       player.turnCard(0, 1)
//       opponent.turnCard(0, 0)
//       opponent.turnCard(0, 1)

//       game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)
//       game.turn = 0
//       game.turnStatus = TURN_STATUS.CHOOSE_A_PILE

//       await expect(() => instance.onReplay(socket)).rejects.toThrowError(
//         ERROR.NOT_ALLOWED,
//       )

//       expect(socket.emit).not.toHaveBeenCalled()
//     })

//     it("should ask to replay the game but not restart it", async () => {
//       const player = new SkyjoPlayer(
//         { username: "player1", avatar: AVATARS.PENGUIN },
//         TEST_SOCKET_ID,
//       )
//       const game = new Skyjo(player.id, new SkyjoSettings(false))
//       game.addPlayer(player)
//       instance["games"].push(game)
//       socket.data.gameCode = game.code
//       socket.data.playerId = player.id

//       const opponent = new SkyjoPlayer(
//         { username: "player2", avatar: AVATARS.ELEPHANT },
//         "socketId132312",
//       )
//       game.addPlayer(opponent)
//       game.start()

//       player.turnCard(0, 0)
//       player.turnCard(0, 1)
//       opponent.turnCard(0, 0)
//       opponent.turnCard(0, 1)

//       game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)
//       game.status = GAME_STATUS.FINISHED

//       await instance.onReplay(socket)

//       expect(socket.emit).toHaveBeenCalledOnce()
//       expect(player.wantsReplay).toBeTruthy()
//       expect(game.status).toBe<GameStatus>(GAME_STATUS.FINISHED)
//     })

//     it("should ask to replay the game and restart it", async () => {
//       const player = new SkyjoPlayer(
//         { username: "player1", avatar: AVATARS.PENGUIN },
//         TEST_SOCKET_ID,
//       )
//       const game = new Skyjo(player.id, new SkyjoSettings(false))
//       game.addPlayer(player)
//       instance["games"].push(game)
//       socket.data.gameCode = game.code
//       socket.data.playerId = player.id

//       const opponent = new SkyjoPlayer(
//         { username: "player2", avatar: AVATARS.ELEPHANT },
//         "socketId132312",
//       )
//       game.addPlayer(opponent)
//       game.start()

//       player.turnCard(0, 0)
//       player.turnCard(0, 1)
//       opponent.turnCard(0, 0)
//       opponent.turnCard(0, 1)

//       game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)
//       game.status = GAME_STATUS.FINISHED

//       opponent.wantsReplay = true

//       await instance.onReplay(socket)

//       expect(socket.emit).toHaveBeenCalledOnce()
//       game.players.forEach((player) => {
//         expect(player.wantsReplay).toBeFalsy()
//       })
//       expect(game.status).toBe<GameStatus>(GAME_STATUS.LOBBY)
//     })
//   })

//   describe("on leave", () => {
//     it("should do nothing if player is not in a game", async () => {
//       socket.data.gameCode = TEST_UNKNOWN_GAME_ID

//       await expect(() => instance.onLeave(socket)).rejects.toThrowError(
//         ERROR.GAME_NOT_FOUND,
//       )
//     })

//     it("should throw if player is not in the game", async () => {
//       const opponent = new SkyjoPlayer(
//         { username: "player2", avatar: AVATARS.ELEPHANT },
//         "socketId132312",
//       )
//       const game = new Skyjo(opponent.id, new SkyjoSettings(false))
//       game.addPlayer(opponent)

//       instance["games"].push(game)
//       socket.data.gameCode = game.code

//       const opponent2 = new SkyjoPlayer(
//         { username: "opponent2", avatar: AVATARS.TURTLE },
//         "socketId9887",
//       )
//       game.addPlayer(opponent2)
//       game.start()

//       await expect(() => instance.onLeave(socket)).rejects.toThrowError(
//         ERROR.PLAYER_NOT_FOUND,
//       )
//     })

//     it("should set the player to connection lost", async () => {
//       const player = new SkyjoPlayer(
//         { username: "player1", avatar: AVATARS.PENGUIN },
//         TEST_SOCKET_ID,
//       )
//       const game = new Skyjo(player.id, new SkyjoSettings(false))
//       game.addPlayer(player)
//       instance["games"].push(game)
//       socket.data.gameCode = game.code
//       socket.data.playerId = player.id

//       const opponent = new SkyjoPlayer(
//         { username: "player2", avatar: AVATARS.ELEPHANT },
//         "socketId132312",
//       )
//       game.addPlayer(opponent)
//       game.start()

//       player.turnCard(0, 0)
//       player.turnCard(0, 1)
//       opponent.turnCard(0, 0)
//       opponent.turnCard(0, 1)

//       game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)

//       await instance.onLeave(socket, true)

//       expect(player.connectionStatus).toBe<ConnectionStatus>(
//         CONNECTION_STATUS.CONNECTION_LOST,
//       )
//     })

//     it("should remove the player from the game if the game is in lobby", async () => {
//       const opponent = new SkyjoPlayer(
//         { username: "player1", avatar: AVATARS.ELEPHANT },
//         "socket456",
//       )
//       const game = new Skyjo(opponent.id, new SkyjoSettings(false))
//       game.addPlayer(opponent)

//       instance["games"].push(game)

//       const player = new SkyjoPlayer(
//         { username: "player2", avatar: AVATARS.PENGUIN },
//         TEST_SOCKET_ID,
//       )
//       game.addPlayer(player)
//       socket.data.gameCode = game.code
//       socket.data.playerId = player.id
//       socket.data.playerId = player.id

//       await instance.onLeave(socket)

//       expect(game.status).toBe<GameStatus>(GAME_STATUS.LOBBY)
//       expect(game.players.length).toBe(1)
//     })

//     // it("should disconnect the player, not stop the game, change turn and change the admin", async () => {
//     //   const player = new SkyjoPlayer(
//     //     { username: "player2", avatar: AVATARS.PENGUIN },
//     //     TEST_SOCKET_ID,
//     //   )
//     //   const game = new Skyjo(player.id, new SkyjoSettings(false))
//     //   game.addPlayer(player)
//     //   instance["games"].push(game)
//     //   socket.data.gameCode = game.code
//     // socket.data.playerId = player.id

//     //   const opponent = new SkyjoPlayer(
//     //     { username: "player1", avatar: AVATARS.ELEPHANT },
//     //     "socket456",
//     //   )
//     //   game.addPlayer(opponent)

//     //   const opponent2 = new SkyjoPlayer(
//     //     { username: "opponent2", avatar: AVATARS.TURTLE },
//     //     "socketId9887",
//     //   )
//     //   game.addPlayer(opponent2)

//     //   game.start()

//     //   player.turnCard(0, 0)
//     //   player.turnCard(0, 1)
//     //   opponent.turnCard(0, 0)
//     //   opponent.turnCard(0, 1)
//     //   opponent2.turnCard(0, 0)
//     //   opponent2.turnCard(0, 1)

//     //   game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)

//     //   game.turn = 0

//     //   await instance.onLeave(socket)

//     //   expect(player.connectionStatus).toBe<ConnectionStatus>(
//     //     CONNECTION_STATUS.DISCONNECTED,
//     //   )
//     //   expect(game.status).toBe<GameStatus>(GAME_STATUS.PLAYING)
//     //   expect(game.players.length).toBe(3)
//     //   expect(game.turn).toBe(1)
//     // })

//     it("should set the player to leave state and let the game goes", async () => {
//       const opponent = new SkyjoPlayer(
//         { username: "player1", avatar: AVATARS.ELEPHANT },
//         "socket456",
//       )
//       const game = new Skyjo(opponent.id, new SkyjoSettings(false))
//       game.addPlayer(opponent)

//       instance["games"].push(game)

//       const player = new SkyjoPlayer(
//         { username: "player2", avatar: AVATARS.PENGUIN },
//         TEST_SOCKET_ID,
//       )
//       game.addPlayer(player)
//       socket.data.gameCode = game.code
//       socket.data.playerId = player.id

//       const opponent2 = new SkyjoPlayer(
//         { username: "opponent2", avatar: AVATARS.TURTLE },
//         "socketId9887",
//       )
//       game.addPlayer(opponent2)

//       game.start()

//       player.cards[0][0] = new SkyjoCard(11)
//       player.cards[0][1] = new SkyjoCard(11)

//       opponent.cards[0][0] = new SkyjoCard(12)
//       opponent.cards[0][1] = new SkyjoCard(12)

//       opponent2.cards[0][0] = new SkyjoCard(11)
//       opponent2.cards[0][1] = new SkyjoCard(11)

//       opponent.turnCard(0, 0)
//       opponent.turnCard(0, 1)
//       opponent2.turnCard(0, 0)
//       opponent2.turnCard(0, 1)

//       await instance.onLeave(socket)

//       expect(player.connectionStatus).toBe<ConnectionStatus>(
//         CONNECTION_STATUS.LEAVE,
//       )
//       expect(game.status).toBe<GameStatus>(GAME_STATUS.PLAYING)
//       expect(game.players.length).toBe(3)
//     })

//     it("should disconnect the player and remove the game if there is no more player", async () => {
//       const player = new SkyjoPlayer(
//         { username: "player1", avatar: AVATARS.PENGUIN },
//         TEST_SOCKET_ID,
//       )
//       const game = new Skyjo(player.id, new SkyjoSettings(false))
//       game.addPlayer(player)
//       socket.data.gameCode = game.code
//       socket.data.playerId = player.id
//       instance["games"].push(game)

//       await instance.onLeave(socket)

//       expect(game.status).toBe<GameStatus>(GAME_STATUS.LOBBY)
//       expect(game.players.length).toBe(0)
//     })

//     it("should disconnect the player after timeout expired and start the game because everyone turned the number of cards to start", async () => {
//       vi.useFakeTimers()

//       const opponent = new SkyjoPlayer(
//         { username: "player1", avatar: AVATARS.ELEPHANT },
//         "socket456",
//       )
//       const game = new Skyjo(opponent.id, new SkyjoSettings(false))
//       game.addPlayer(opponent)

//       instance["games"].push(game)

//       const player = new SkyjoPlayer(
//         { username: "player2", avatar: AVATARS.PENGUIN },
//         TEST_SOCKET_ID,
//       )
//       game.addPlayer(player)
//       socket.data.gameCode = game.code
//       socket.data.playerId = player.id

//       const opponent2 = new SkyjoPlayer(
//         { username: "opponent2", avatar: AVATARS.TURTLE },
//         "socketId9887",
//       )
//       game.addPlayer(opponent2)

//       game.start()

//       player.cards[0][0] = new SkyjoCard(11)
//       player.cards[0][1] = new SkyjoCard(11)

//       opponent.cards[0][0] = new SkyjoCard(12)
//       opponent.cards[0][1] = new SkyjoCard(12)

//       opponent2.cards[0][0] = new SkyjoCard(11)
//       opponent2.cards[0][1] = new SkyjoCard(11)

//       opponent.turnCard(0, 0)
//       opponent.turnCard(0, 1)
//       opponent2.turnCard(0, 0)
//       opponent2.turnCard(0, 1)

//       await instance.onLeave(socket)

//       expect(player.connectionStatus).toBe<ConnectionStatus>(
//         CONNECTION_STATUS.LEAVE,
//       )
//       expect(game.status).toBe<GameStatus>(GAME_STATUS.PLAYING)
//       expect(game.roundStatus).toBe<RoundStatus>(
//         ROUND_STATUS.WAITING_PLAYERS_TO_TURN_INITIAL_CARDS,
//       )
//       expect(game.players.length).toBe(3)

//       vi.runAllTimers()

//       expect(player.connectionStatus).toBe<ConnectionStatus>(
//         CONNECTION_STATUS.DISCONNECTED,
//       )
//       expect(game.status).toBe<GameStatus>(GAME_STATUS.PLAYING)
//       expect(game.roundStatus).toBe<RoundStatus>(ROUND_STATUS.PLAYING)
//       expect(game.players.length).toBe(3)

//       vi.useRealTimers()
//     })

//     it("should disconnect the player after timeout expired and broadcast the game", async () => {
//       vi.useFakeTimers()

//       const opponent = new SkyjoPlayer(
//         { username: "player1", avatar: AVATARS.ELEPHANT },
//         "socket456",
//       )
//       const game = new Skyjo(opponent.id, new SkyjoSettings(false))
//       game.addPlayer(opponent)

//       instance["games"].push(game)

//       const player = new SkyjoPlayer(
//         { username: "player2", avatar: AVATARS.PENGUIN },
//         TEST_SOCKET_ID,
//       )
//       game.addPlayer(player)
//       socket.data.gameCode = game.code
//       socket.data.playerId = player.id

//       const opponent2 = new SkyjoPlayer(
//         { username: "opponent2", avatar: AVATARS.TURTLE },
//         "socketId9887",
//       )
//       game.addPlayer(opponent2)

//       game.start()

//       player.cards[0][0] = new SkyjoCard(11)
//       player.cards[0][1] = new SkyjoCard(11)

//       opponent.cards[0][0] = new SkyjoCard(12)
//       opponent.cards[0][1] = new SkyjoCard(12)

//       opponent2.cards[0][0] = new SkyjoCard(11)
//       opponent2.cards[0][1] = new SkyjoCard(11)

//       player.turnCard(0, 0)
//       player.turnCard(0, 1)
//       opponent.turnCard(0, 0)
//       opponent.turnCard(0, 1)
//       opponent2.turnCard(0, 0)
//       opponent2.turnCard(0, 1)

//       game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)

//       await instance.onLeave(socket)

//       expect(player.connectionStatus).toBe<ConnectionStatus>(
//         CONNECTION_STATUS.LEAVE,
//       )
//       expect(game.status).toBe<GameStatus>(GAME_STATUS.PLAYING)
//       expect(game.roundStatus).toBe<RoundStatus>(ROUND_STATUS.PLAYING)
//       expect(game.players.length).toBe(3)

//       vi.runAllTimers()

//       expect(player.connectionStatus).toBe<ConnectionStatus>(
//         CONNECTION_STATUS.DISCONNECTED,
//       )
//       expect(game.status).toBe<GameStatus>(GAME_STATUS.PLAYING)
//       expect(game.roundStatus).toBe<RoundStatus>(ROUND_STATUS.PLAYING)
//       expect(game.players.length).toBe(3)

//       vi.useRealTimers()
//     })

//     it("should disconnect the player after timeout expired and change who has to play", async () => {
//       vi.useFakeTimers()

//       const opponent = new SkyjoPlayer(
//         { username: "player1", avatar: AVATARS.ELEPHANT },
//         "socket456",
//       )
//       const game = new Skyjo(opponent.id, new SkyjoSettings(false))
//       game.addPlayer(opponent)

//       instance["games"].push(game)

//       const player = new SkyjoPlayer(
//         { username: "player2", avatar: AVATARS.PENGUIN },
//         TEST_SOCKET_ID,
//       )
//       game.addPlayer(player)
//       socket.data.gameCode = game.code
//       socket.data.playerId = player.id

//       const opponent2 = new SkyjoPlayer(
//         { username: "opponent2", avatar: AVATARS.TURTLE },
//         "socketId9887",
//       )
//       game.addPlayer(opponent2)

//       game.start()

//       player.cards[0][0] = new SkyjoCard(12)
//       player.cards[0][1] = new SkyjoCard(12)

//       opponent.cards[0][0] = new SkyjoCard(10)
//       opponent.cards[0][1] = new SkyjoCard(10)

//       opponent2.cards[0][0] = new SkyjoCard(11)
//       opponent2.cards[0][1] = new SkyjoCard(11)

//       player.turnCard(0, 0)
//       player.turnCard(0, 1)
//       opponent.turnCard(0, 0)
//       opponent.turnCard(0, 1)
//       opponent2.turnCard(0, 0)
//       opponent2.turnCard(0, 1)

//       game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)

//       await instance.onLeave(socket)

//       expect(player.connectionStatus).toBe<ConnectionStatus>(
//         CONNECTION_STATUS.LEAVE,
//       )
//       expect(game.status).toBe<GameStatus>(GAME_STATUS.PLAYING)
//       expect(game.roundStatus).toBe<RoundStatus>(ROUND_STATUS.PLAYING)
//       expect(game.players.length).toBe(3)
//       expect(game.turn).toBe(1)

//       vi.runAllTimers()

//       expect(player.connectionStatus).toBe<ConnectionStatus>(
//         CONNECTION_STATUS.DISCONNECTED,
//       )
//       expect(game.status).toBe<GameStatus>(GAME_STATUS.PLAYING)
//       expect(game.roundStatus).toBe<RoundStatus>(ROUND_STATUS.PLAYING)
//       expect(game.players.length).toBe(3)
//       expect(game.turn).toBe(2)

//       vi.useRealTimers()
//     })

//     it("should disconnect the player after timeout expired and stop the game", async () => {
//       vi.useFakeTimers()

//       const opponent = new SkyjoPlayer(
//         { username: "player1", avatar: AVATARS.ELEPHANT },
//         "socket456",
//       )
//       const game = new Skyjo(opponent.id, new SkyjoSettings(false))
//       game.addPlayer(opponent)

//       instance["games"].push(game)

//       const player = new SkyjoPlayer(
//         { username: "player2", avatar: AVATARS.PENGUIN },
//         TEST_SOCKET_ID,
//       )
//       game.addPlayer(player)
//       socket.data.gameCode = game.code
//       socket.data.playerId = player.id

//       game.start()

//       player.cards[0][0] = new SkyjoCard(11)
//       player.cards[0][1] = new SkyjoCard(11)

//       opponent.cards[0][0] = new SkyjoCard(12)
//       opponent.cards[0][1] = new SkyjoCard(12)

//       opponent.turnCard(0, 0)
//       opponent.turnCard(0, 1)

//       await instance.onLeave(socket)

//       expect(player.connectionStatus).toBe<ConnectionStatus>(
//         CONNECTION_STATUS.LEAVE,
//       )
//       expect(game.status).toBe<GameStatus>(GAME_STATUS.PLAYING)
//       expect(game.players.length).toBe(2)

//       vi.runAllTimers()

//       expect(player.connectionStatus).toBe<ConnectionStatus>(
//         CONNECTION_STATUS.DISCONNECTED,
//       )
//       expect(game.status).toBe<GameStatus>(GAME_STATUS.STOPPED)
//       expect(game.players.length).toBe(2)
//       expect(instance["games"].length).toBe(0)

//       vi.useRealTimers()
//     })
//   })

//   describe("on reconnect", () => {
//     it("should throw if player is not in a game", async () => {
//       const lastGame: LastGame = {
//         gameCode: TEST_UNKNOWN_GAME_ID,
//         playerId: TEST_SOCKET_ID,
//       }

//       await expect(() =>
//         instance.onReconnect(socket, lastGame),
//       ).rejects.toThrowError(ERROR.PLAYER_NOT_FOUND)

//       expect(socket.emit).not.toHaveBeenCalled()
//     })

//     it("should throw if player is in the game but cannot reconnect", async () => {
//       const player = new SkyjoPlayer(
//         { username: "player1", avatar: AVATARS.PENGUIN },
//         TEST_SOCKET_ID,
//       )
//       const game = new Skyjo(player.id, new SkyjoSettings(false))
//       game.addPlayer(player)
//       instance["games"].push(game)
//       socket.data.gameCode = game.code
//       socket.data.playerId = player.id

//       const opponent = new SkyjoPlayer(
//         { username: "player2", avatar: AVATARS.ELEPHANT },
//         "socketId132312",
//       )
//       game.addPlayer(opponent)
//       game.start()

//       player.turnCard(0, 0)
//       player.turnCard(0, 1)
//       opponent.turnCard(0, 0)
//       opponent.turnCard(0, 1)

//       game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)

//       await instance.onLeave(socket, true)
//       const lastGame: LastGame = {
//         gameCode: game.code,
//         playerId: player.id,
//       }
//       vi.spyOn(instance["gameService"], "isPlayerInGame").mockReturnValue(
//         Promise.resolve(true),
//       )
//       vi.spyOn(instance["playerService"], "canReconnect").mockReturnValue(
//         Promise.resolve(false),
//       )

//       await expect(() =>
//         instance.onReconnect(socket, lastGame),
//       ).rejects.toThrowError(ERROR.CANNOT_RECONNECT)
//     })

//     it("should reconnect the player if in the time limit", async () => {
//       const player = new SkyjoPlayer(
//         { username: "player1", avatar: AVATARS.PENGUIN },
//         TEST_SOCKET_ID,
//       )
//       const game = new Skyjo(player.id, new SkyjoSettings(false))
//       game.addPlayer(player)
//       instance["games"].push(game)

//       const opponent = new SkyjoPlayer(
//         { username: "player2", avatar: AVATARS.ELEPHANT },
//         "socketId132312",
//       )
//       game.addPlayer(opponent)
//       game.start()

//       player.turnCard(0, 0)
//       player.turnCard(0, 1)
//       opponent.turnCard(0, 0)
//       opponent.turnCard(0, 1)

//       game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)

//       socket.data = {
//         gameCode: game.code,
//         playerId: player.id,
//       }
//       await instance.onLeave(socket, true)

//       expect(player.connectionStatus).toBe<ConnectionStatus>(
//         CONNECTION_STATUS.CONNECTION_LOST,
//       )

//       const lastGame: LastGame = {
//         gameCode: game.code,
//         playerId: player.id,
//       }
//       vi.spyOn(instance["gameService"], "isPlayerInGame").mockReturnValue(
//         Promise.resolve(true),
//       )
//       vi.spyOn(instance["playerService"], "canReconnect").mockReturnValue(
//         Promise.resolve(true),
//       )

//       await instance.onReconnect(socket, lastGame)

//       expect(player.connectionStatus).toBe<ConnectionStatus>(
//         CONNECTION_STATUS.CONNECTED,
//       )
//     })

//     it("should reconnect the player if no time limit", async () => {
//       const player = new SkyjoPlayer(
//         { username: "player1", avatar: AVATARS.PENGUIN },
//         TEST_SOCKET_ID,
//       )
//       const game = new Skyjo(player.id, new SkyjoSettings(false))
//       game.addPlayer(player)
//       instance["games"].push(game)

//       const opponent = new SkyjoPlayer(
//         { username: "player2", avatar: AVATARS.ELEPHANT },
//         "socketId132312",
//       )
//       game.addPlayer(opponent)
//       game.start()

//       player.turnCard(0, 0)
//       player.turnCard(0, 1)
//       opponent.turnCard(0, 0)
//       opponent.turnCard(0, 1)

//       game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)

//       socket.data = {
//         gameCode: game.code,
//         playerId: player.id,
//       }
//       const lastGame: LastGame = {
//         gameCode: game.code,
//         playerId: player.id,
//       }
//       vi.spyOn(instance["gameService"], "isPlayerInGame").mockReturnValue(
//         Promise.resolve(true),
//       )
//       vi.spyOn(instance["playerService"], "canReconnect").mockReturnValue(
//         Promise.resolve(true),
//       )

//       await instance.onReconnect(socket, lastGame)

//       expect(player.connectionStatus).toBe<ConnectionStatus>(
//         CONNECTION_STATUS.CONNECTED,
//       )
//     })
//   })

//   describe("on message", () => {
//     it("should throw if game does not exist", async () => {
//       socket.data.gameCode = TEST_UNKNOWN_GAME_ID

//       await expect(() =>
//         instance.onMessage(socket, { username: "player1", message: "Hello!" }),
//       ).rejects.toThrowError(ERROR.GAME_NOT_FOUND)

//       expect(socket.emit).not.toHaveBeenCalled()
//     })

//     it("should throw if player is not in the game", async () => {
//       const opponent = new SkyjoPlayer(
//         { username: "player1", avatar: AVATARS.ELEPHANT },
//         "socket456",
//       )
//       const game = new Skyjo(opponent.id, new SkyjoSettings(false))
//       game.addPlayer(opponent)
//       instance["games"].push(game)

//       socket.data.gameCode = game.code

//       await expect(() =>
//         instance.onMessage(socket, { username: "player2", message: "Hello!" }),
//       ).rejects.toThrowError(ERROR.PLAYER_NOT_FOUND)

//       expect(socket.emit).not.toHaveBeenCalled()
//     })

//     it("should send a message", async () => {
//       const player = new SkyjoPlayer(
//         { username: "player1", avatar: AVATARS.PENGUIN },
//         TEST_SOCKET_ID,
//       )
//       const game = new Skyjo(player.id, new SkyjoSettings(false))
//       game.addPlayer(player)
//       instance["games"].push(game)
//       socket.data.gameCode = game.code
//       socket.data.playerId = player.id

//       const opponent = new SkyjoPlayer(
//         { username: "player2", avatar: AVATARS.ELEPHANT },
//         "socketId132312",
//       )
//       game.addPlayer(opponent)

//       await instance.onMessage(socket, {
//         username: "player2",
//         message: "Hello!",
//       })

//       expect(socket.emit).toHaveBeenCalledOnce()
//     })
//   })
// })

// const mockPlayerService = () => {
//   return {
//     createPlayer: vi.fn(),
//     updatePlayer: vi.fn(),
//     updateSocketId: vi.fn(),
//     removePlayer: vi.fn(),
//     canReconnect: vi.fn(),
//     updateDisconnectionDate: vi.fn(),
//     reconnectPlayer: vi.fn(),
//     getPlayersByGameId: vi.fn(),
//   } satisfies PlayerService
// }

// const mockGameService = () => {
//   return {
//     playerService: mockPlayerService(),
//     createGame: vi.fn(),
//     updateGame: vi.fn(),
//     updateSettings: vi.fn(),
//     updateAdmin: vi.fn(),
//     getGamesByRegion: vi.fn(),
//     getGameById: vi.fn(),
//     getGameByCode: vi.fn(),
//     getPublicGameWithFreePlace: vi.fn(),
//     isPlayerInGame: vi.fn(),
//     retrieveGameByCode: vi.fn(),
//     removeGame: vi.fn(),
//     removeInactiveGames: vi.fn(),
//   } satisfies Omit<GameService, "formatSkyjo"> as any as GameService
// }
