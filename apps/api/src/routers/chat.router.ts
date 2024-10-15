import { ChatService } from "@/services/chat.service"
import { socketErrorHandlerWrapper } from "@/utils/socketErrorHandlerWrapper"
import {
  SendChatMessage,
  sendChatMessage,
} from "shared/validations/chatMessage"
import { SkyjoSocket } from "../types/skyjoSocket"

const instance = new ChatService()

const chatRouter = (socket: SkyjoSocket) => {
  socket.on(
    "message",
    socketErrorHandlerWrapper(async (data: SendChatMessage) => {
      const message = sendChatMessage.parse(data)
      await instance.onMessage(socket, message)
    }),
  )
}

export { chatRouter }
