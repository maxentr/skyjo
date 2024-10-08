import { Skyjo } from "@/class/Skyjo"
import { SkyjoPlayer } from "@/class/SkyjoPlayer"
import { SkyjoSettings } from "@/class/SkyjoSettings"
import { mockBaseService, mockSocket } from "@/services/__tests__/_mock"
import { BaseService } from "@/services/base.service"
import { SkyjoSocket } from "@/types/skyjoSocket"
import { TEST_SOCKET_ID, TEST_UNKNOWN_GAME_ID } from "@tests/constants-test"
import { AVATARS, ERROR } from "shared/constants"
import { beforeEach, describe, expect, it } from "vitest"
import { ChatService } from "../chat.service"

describe("ChatService", () => {
  let service: ChatService
  let socket: SkyjoSocket

  beforeEach(() => {
    mockBaseService()
    service = new ChatService()

    socket = mockSocket()
  })

  it("should be defined", () => {
    expect(ChatService).toBeDefined()
  })

  describe("on message", () => {
    it("should throw if game does not exist", async () => {
      socket.data.gameCode = TEST_UNKNOWN_GAME_ID

      await expect(() =>
        service.onMessage(socket, { username: "player1", message: "Hello!" }),
      ).rejects.toThrowError(ERROR.GAME_NOT_FOUND)

      expect(socket.emit).not.toHaveBeenCalled()
    })

    it("should throw if player is not in the game", async () => {
      const opponent = new SkyjoPlayer(
        { username: "player1", avatar: AVATARS.ELEPHANT },
        "socket456",
      )
      const game = new Skyjo(opponent.id, new SkyjoSettings(false))
      game.addPlayer(opponent)
      BaseService["games"].push(game)

      socket.data.gameCode = game.code

      await expect(() =>
        service.onMessage(socket, { username: "player2", message: "Hello!" }),
      ).rejects.toThrowError(ERROR.PLAYER_NOT_FOUND)

      expect(socket.emit).not.toHaveBeenCalled()
    })

    it("should send a message", async () => {
      const player = new SkyjoPlayer(
        { username: "player1", avatar: AVATARS.PENGUIN },
        TEST_SOCKET_ID,
      )
      const game = new Skyjo(player.id, new SkyjoSettings(false))
      game.addPlayer(player)
      BaseService["games"].push(game)
      socket.data.gameCode = game.code
      socket.data.playerId = player.id

      const opponent = new SkyjoPlayer(
        { username: "player2", avatar: AVATARS.ELEPHANT },
        "socketId132312",
      )
      game.addPlayer(opponent)

      await service.onMessage(socket, {
        username: "player2",
        message: "Hello!",
      })

      expect(socket.emit).toHaveBeenCalledOnce()
    })
  })
})
