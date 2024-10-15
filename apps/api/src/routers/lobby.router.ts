import { LobbyService } from "@/services/lobby.service"
import { Logger } from "@/utils/logs"
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
  socket.on("create-private", async (player: CreatePlayer) => {
    try {
      const parsedPlayer = createPlayer.parse(player)
      await instance.onCreate(socket, parsedPlayer)
    } catch (error) {
      Logger.error(`Error while creating a game`, {
        error,
      })
    }
  })

  socket.on("find", async (player: CreatePlayer) => {
    try {
      const parsedPlayer = createPlayer.parse(player)
      await instance.onFind(socket, parsedPlayer)
    } catch (error) {
      Logger.error(`Error while finding a game`, {
        error,
      })
    }
  })

  socket.on("join", async (data: JoinGame) => {
    try {
      const { gameCode, player } = joinGame.parse(data)
      await instance.onJoin(socket, gameCode, player)
    } catch (error: unknown) {
      if (error instanceof Error) {
        socket.emit("error:join", error.message as ErrorJoinMessage)
      }
      Logger.error(`Error while joining a game`, {
        error,
      })
    }
  })

  socket.on("settings", async (data: ChangeSettings) => {
    try {
      const newSettings = changeSettings.parse(data)
      await instance.onSettingsChange(socket, newSettings)
    } catch (error) {
      Logger.error(`Error while changing the game settings`, {
        error,
      })
    }
  })

  socket.on("start", async () => {
    try {
      await instance.onGameStart(socket)
    } catch (error) {
      Logger.error(`Error while starting a game`, {
        error,
      })
    }
  })
}

export { lobbyRouter }
