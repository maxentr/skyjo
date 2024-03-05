export type ChatMessageType = "message" | "system"

export type ChatMessage = {
  id: string
  username?: string
  message: string
  type: ChatMessageType
}
