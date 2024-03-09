import { cn } from "@/lib/utils"
import { cva } from "class-variance-authority"
import { ChatMessage } from "shared/types/chat"

type ChatMessageProps = {
  message: ChatMessage
}

const chatMessageClasses = cva("font-medium", {
  variants: {
    type: {
      message: "text-slate-800",
      info: "text-blue-600",
      warn: "text-yellow-600",
      "player-joined": "text-green-600",
      "player-left": "text-red-600",
    },
  },
})
const ChatMessage = ({ message }: ChatMessageProps) => (
  <p
    className={cn(
      "font-inter text-sm",
      chatMessageClasses({ type: message.type }),
    )}
  >
    {message?.username && (
      <span className="font-bold">{message?.username} : </span>
    )}
    {message.message}
  </p>
)

export default ChatMessage
