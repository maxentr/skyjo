import { MESSAGE_TYPE, SystemMessageType } from "../constants"

export type PlayerChatMessage = {
  id: string
  username?: string
  message: string
  type: typeof MESSAGE_TYPE.USER_MESSAGE
}

export type SystemChatMessage = {
  id: string
  username?: string
  message: SystemMessageType
  type: SystemMessageType
}

export type ChatMessage = PlayerChatMessage | SystemChatMessage
