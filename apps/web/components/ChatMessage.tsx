import { cn } from "@/lib/utils"
import { cva } from "class-variance-authority"
import { useTranslations } from "next-intl"
import type { ChatMessage } from "shared/types/chat"

type ChatMessageProps = {
  message: ChatMessage
}

const chatMessageClasses = cva("", {
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
const ChatMessage = ({ message }: ChatMessageProps) => {
  const t = useTranslations("components.ChatMessage")
  return (
    <p
      className={cn(
        "font-inter text-sm text-wrap break-words w-full",
        chatMessageClasses({ type: message.type }),
      )}
    >
      {message?.username && (
        <span className="font-semibold">
          {message?.username}
          {t("separator")}
        </span>
      )}
      {message.message}
    </p>
  )
}

export default ChatMessage
