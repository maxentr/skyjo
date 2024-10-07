import { BaseService } from "@/services/base.service"
import { SkyjoSocket } from "@/types/skyjoSocket"
import { ERROR, USER_MESSAGE_TYPE } from "shared/constants"
import { UserChatMessage } from "shared/types/chat"

export class ChatService extends BaseService {
  constructor() {
    super()
  }

  async onMessage(
    socket: SkyjoSocket,
    { username, message }: Omit<UserChatMessage, "id" | "type">,
  ) {
    const game = await this.getGame(socket.data.gameCode)

    if (!game.getPlayerById(socket.data.playerId))
      throw new Error(ERROR.PLAYER_NOT_FOUND)

    game.updatedAt = new Date()

    const newMessage: UserChatMessage = {
      id: crypto.randomUUID(),
      username,
      message,
      type: USER_MESSAGE_TYPE,
    }

    socket.to(game.code).emit("message", newMessage)
    socket.emit("message", newMessage)
  }
}
