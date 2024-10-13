import { ChatService } from "@/services/chat.service"
import { Logger } from "@/utils/logs"
import {
  SendChatMessage,
  sendChatMessage,
} from "shared/validations/chatMessage"
import { SkyjoSocket } from "../types/skyjoSocket"

const instance = new ChatService()

const chatRouter = (socket: SkyjoSocket) => {
  socket.on("message", (data: SendChatMessage) => {
    try {
      const message = sendChatMessage.parse(data)
      instance.onMessage(socket, message)
    } catch (error) {
      Logger.error(`Error while chatting`, {
        error,
      })
    }
  })
}

export { chatRouter }
