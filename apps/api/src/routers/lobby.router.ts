import { LobbyService } from "@/services/lobby.service"
import { logger } from "@/utils/logs"
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
  socket.on("create-private", (player: CreatePlayer) => {
    try {
      const parsedPlayer = createPlayer.parse(player)
      instance.onCreate(socket, parsedPlayer)
    } catch (error) {
      logger.error(`Error while creating a game : ${error}`)
    }
  })

  socket.on("find", async (player: CreatePlayer) => {
    try {
      const parsedPlayer = createPlayer.parse(player)
      await instance.onFind(socket, parsedPlayer)
    } catch (error) {
      logger.error(`Error while finding a game : ${error}`)
    }
  })

  socket.on("join", async (data: JoinGame) => {
    try {
      const { gameCode, player } = joinGame.parse(data)
      await instance.onJoin(socket, gameCode, player)
    } catch (error: unknown) {
      if (error instanceof Error) {
        socket.emit("error:join", error.message as ErrorJoinMessage)
        logger.error(`Error while joining a game : ${error.message}`)
      }
    }
  })

  socket.on("settings", async (data: ChangeSettings) => {
    try {
      const newSettings = changeSettings.parse(data)
      instance.onSettingsChange(socket, newSettings)
    } catch (error) {
      logger.error(`Error while changing the game settings : ${error}`)
    }
  })

  socket.on("start", async () => {
    try {
      await instance.onGameStart(socket)
    } catch (error) {
      logger.error(`Error while starting a game : ${error}`)
    }
  })

  socket.on("replay", async () => {
    try {
      await instance.onReplay(socket)
    } catch (error) {
      logger.error(`Error while replaying a game : ${error}`)
    }
  })
}

export { lobbyRouter }
