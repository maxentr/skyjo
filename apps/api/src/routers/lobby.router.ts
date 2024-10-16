import { LobbyService } from "@/services/lobby.service.js"
import { CError } from "@/utils/CError.js"
import { socketErrorHandlerWrapper } from "@/utils/socketErrorHandlerWrapper.js"
import { ERROR } from "shared/constants"
import type { ErrorJoinMessage } from "shared/types/socket"
import {
  type ChangeSettings,
  changeSettings,
} from "shared/validations/changeSettings"
import { type JoinGame, joinGame } from "shared/validations/joinGame"
import { type CreatePlayer, createPlayer } from "shared/validations/player"
import type { SkyjoSocket } from "../types/skyjoSocket.js"

const instance = new LobbyService()

const lobbyRouter = (socket: SkyjoSocket) => {
  socket.on(
    "create-private",
    socketErrorHandlerWrapper(async (player: CreatePlayer) => {
      const parsedPlayer = createPlayer.parse(player)
      await instance.onCreate(socket, parsedPlayer)
    }),
  )

  socket.on(
    "find",
    socketErrorHandlerWrapper(async (player: CreatePlayer) => {
      const parsedPlayer = createPlayer.parse(player)
      await instance.onFind(socket, parsedPlayer)
    }),
  )

  socket.on(
    "join",
    socketErrorHandlerWrapper(async (data: JoinGame) => {
      try {
        const { gameCode, player } = joinGame.parse(data)
        await instance.onJoin(socket, gameCode, player)
      } catch (error) {
        if (
          error instanceof CError &&
          (error.code === ERROR.GAME_NOT_FOUND ||
            error.code === ERROR.GAME_ALREADY_STARTED ||
            error.code === ERROR.GAME_IS_FULL)
        ) {
          socket.emit("error:join", error.code satisfies ErrorJoinMessage)
        } else {
          throw error
        }
      }
    }),
  )

  socket.on(
    "settings",
    socketErrorHandlerWrapper(async (data: ChangeSettings) => {
      const newSettings = changeSettings.parse(data)
      await instance.onSettingsChange(socket, newSettings)
    }),
  )

  socket.on(
    "start",
    socketErrorHandlerWrapper(async () => {
      await instance.onGameStart(socket)
    }),
  )
}

export { lobbyRouter }
