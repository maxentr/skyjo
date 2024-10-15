import { LobbyService } from "@/services/lobby.service"
import { CError } from "@/utils/CError"
import { socketErrorHandlerWrapper } from "@/utils/socketErrorHandlerWrapper"
import { ERROR } from "shared/constants"
import { ErrorJoinMessage } from "shared/types/socket"
import {
  ChangeSettings,
  changeSettings,
} from "shared/validations/changeSettings"
import { JoinGame, joinGame } from "shared/validations/joinGame"
import { CreatePlayer, createPlayer } from "shared/validations/player"
import { SkyjoSocket } from "../types/skyjoSocket"

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
