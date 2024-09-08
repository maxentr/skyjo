"use client"

import ChatForm from "@/components/ChatForm"
import ChatMessageList from "@/components/ChatMessageList"
import { useChat } from "@/contexts/ChatContext"
import { cn } from "@/lib/utils"
import { ClassValue } from "clsx"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"

type ChatProps = {
  className?: ClassValue
  disabled?: boolean
}
const Chat = ({ className, disabled = false }: ChatProps) => {
  const {
    chat,
    setHasUnreadMessage,
    hasUnreadMessage,
    addUnreadMessage,
    clearUnreadMessages,
  } = useChat()
  const t = useTranslations("components.Chat")

  const [open, setOpen] = useState(false)

  useEffect(() => clearUnreadMessages(), [])
  useEffect(() => {
    if (open === false) {
      const lastMessage = chat?.[0]

      if (lastMessage) addUnreadMessage(lastMessage)
    } else {
      clearUnreadMessages()
    }
  }, [chat])

  const toggleOpening = () => {
    const newOpenState = !open
    setOpen(newOpenState)

    if (newOpenState === true) setHasUnreadMessage(false)

    setTimeout(() => {
      if (newOpenState === false) clearUnreadMessages()
    }, 300)
  }

  return (
    <div
      className={cn(
        "absolute right-6 top-full z-10 hidden md:flex items-center justify-end",
        className,
      )}
    >
      <div
        className={`w-80 h-fit pb-2 bg-white shadow border-2 border-b-0 rounded-t-lg border-black flex flex-col items-center duration-300 transition-transform ease-in-out ${
          open ? "-translate-y-full" : "-translate-y-12"
        }`}
      >
        <button
          className="text-center text-black w-full px-4 py-2 transition-all duration-200 focus-visible:outline-black focus-visible:-outline-offset-4"
          onClick={toggleOpening}
          disabled={disabled}
        >
          {t("title")}
        </button>
        <div className="px-2 w-full">
          <hr className="w-full border-black border-t-2" />
        </div>
        {hasUnreadMessage && (
          <>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-400" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-400 animate-ping" />
          </>
        )}
        <div className="h-96 w-full flex flex-col pl-2 pr-1">
          <ChatMessageList />
          <ChatForm chatOpen={open} />
        </div>
      </div>
    </div>
  )
}

export default Chat
