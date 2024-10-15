import { PlayerService } from "@/services/player.service"
import { CError } from "@/utils/CError"
import { Logger } from "@/utils/Logger"
import { socketErrorHandlerWrapper } from "@/utils/socketErrorHandlerWrapper"
import { ERROR } from "shared/constants"
import { ErrorReconnectMessage } from "shared/types/socket"
import { LastGame, reconnect } from "shared/validations/reconnect"
import { DisconnectReason } from "socket.io"
import { SkyjoSocket } from "../types/skyjoSocket"

const instance = new PlayerService()

const playerRouter = (socket: SkyjoSocket) => {
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
