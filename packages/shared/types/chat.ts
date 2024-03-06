export type SystemChatMessageType =
  | "info"
  | "warn"
  | "player-joined"
  | "player-left"

export type PlayerChatMessageType = "message"

export type ChatMessageType = SystemChatMessageType | PlayerChatMessageType

export type PlayerChatMessage = {
  id: string
  username?: string
  message: string
  type: PlayerChatMessageType
}

export type SystemChatMessage = {
  id: string
  username?: string
  message: "game-stopped" | "player-joined" | "player-left"
  type: SystemChatMessageType
}

export type ChatMessage = PlayerChatMessage | SystemChatMessage
