export type ChatMessageType =
  | "message"
  | "info"
  | "warn"
  | "player-join"
  | "player-leave"

export type ChatMessage = {
  id: string
  username?: string
  message: string
  type: ChatMessageType
}
