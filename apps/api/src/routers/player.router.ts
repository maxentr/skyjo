import { Logger } from "@/utils/logs"
import { SkyjoSocket } from "../types/skyjoSocket"

import { PlayerService } from "@/services/player.service"
import { ErrorReconnectMessage } from "shared/types/socket"
import { LastGame, reconnect } from "shared/validations/reconnect"
import { DisconnectReason } from "socket.io"

const instance = new PlayerService()

const playerRouter = (socket: SkyjoSocket) => {
  socket.on("leave", async () => {
    try {
      await instance.onLeave(socket)
      socket.emit("leave:success")
    } catch (error) {
      Logger.error(`Error while leaving a game`, {
        error,
      })
    }
  })

  socket.on("disconnect", async (reason: DisconnectReason) => {
    try {
      Logger.info(`Socket ${socket.id} disconnected for reason ${reason}`)
      if (reason === "ping timeout") await instance.onLeave(socket, true)
      else await instance.onLeave(socket)
    } catch (error) {
      Logger.error(`Error while disconnecting a game`, {
        error,
      })
    }
  })

  socket.on("reconnect", async (reconnectData: LastGame) => {
    try {
      reconnect.parse(reconnectData)
      await instance.onReconnect(socket, reconnectData)
    } catch (error) {
      if (error instanceof Error) {
        socket.emit("error:reconnect", error.message as ErrorReconnectMessage)
      }
      Logger.error(`Error while reconnecting a game`, {
        error,
      })
    }
  })
}

export { playerRouter }
