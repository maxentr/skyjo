import ChatMessage from "@/components/ChatMessage"
import { useSkyjo } from "@/contexts/SkyjoContext"
import { useTranslations } from "next-intl"

type ChatMessageListProps = Readonly<{
  unreadMessages: ChatMessage[]
}>

function ChatMessageList({ unreadMessages }: ChatMessageListProps) {
  const { chat } = useSkyjo()
  const t = useTranslations("components.ChatMessageList")

  return (
    <div
      id="messages-container"
      className="overflow-y-auto flex flex-grow flex-col-reverse my-2 gap-2 scrollbar-thin scrollbar-thumb-black scrollbar-track-transparent scrollbar-thumb-rounded-full scrollbar-track-rounded-full"
    >
      {unreadMessages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
      {unreadMessages.length > 0 && (
        <div className="flex flex-row items-center">
          <hr className="flex-grow border-red-500" />
          <p className="font-inter text-sm text-red-500 px-2">
            {t("unread-messages", { count: unreadMessages.length })}
          </p>
          <hr className="flex-grow border-red-500" />
        </div>
      )}
      {chat
        .filter((message) => !unreadMessages.includes(message))
        .map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
    </div>
  )
}

export default ChatMessageList
