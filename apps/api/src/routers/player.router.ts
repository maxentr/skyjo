import { PlayerService } from "@/services/player.service.js"
import { CError } from "@/utils/CError.js"
import { Logger } from "@/utils/Logger.js"
import { socketErrorHandlerWrapper } from "@/utils/socketErrorHandlerWrapper.js"
import { ERROR } from "shared/constants"
import type { ErrorReconnectMessage } from "shared/types/socket"
import { type LastGame, reconnect } from "shared/validations/reconnect"
import type { DisconnectReason } from "socket.io"
import type { SkyjoSocket } from "../types/skyjoSocket.js"

const instance = new PlayerService()

const playerRouter = (socket: SkyjoSocket) => {
  if (socket.recovered) {
    socketErrorHandlerWrapper(async () => {
      await instance.onRecover(socket)
    })
  }

  socket.on(
    "leave",
    socketErrorHandlerWrapper(async () => {
      await instance.onLeave(socket)
      socket.emit("leave:success")
    }),
  )

  socket.on(
    "disconnect",
    socketErrorHandlerWrapper(async (reason: DisconnectReason) => {
      Logger.info(`Socket ${socket.id} disconnected for reason ${reason}`)
      if (reason === "ping timeout") await instance.onLeave(socket, true)
      else await instance.onLeave(socket)
    }),
  )

  socket.on(
    "reconnect",
    socketErrorHandlerWrapper(async (reconnectData: LastGame) => {
      try {
        reconnect.parse(reconnectData)
        await instance.onReconnect(socket, reconnectData)
      } catch (error) {
        if (error instanceof CError && error.code === ERROR.CANNOT_RECONNECT) {
          socket.emit(
            "error:reconnect",
            error.code satisfies ErrorReconnectMessage,
          )
        } else {
          throw error
        }
      }
    }),
  )
}

export { playerRouter }
