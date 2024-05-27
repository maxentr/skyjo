"use client"

import ChatForm from "@/components/ChatForm"
import ChatMessage from "@/components/ChatMessage"
import ChatMessageList from "@/components/ChatMessageList"
import { useSkyjo } from "@/contexts/SkyjoContext"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"

const Chat = () => {
  const { chat } = useSkyjo()
  const t = useTranslations("components.Chat")

  const [open, setOpen] = useState(false)
  const [unreadMessages, setUnreadMessages] = useState<ChatMessage[]>([])
  const [hasUnreadMessage, setHasUnreadMessage] = useState<boolean>(false)

  const addUnreadMessage = (message: ChatMessage) => {
    setUnreadMessages((prev) => [message, ...prev])
    setHasUnreadMessage(true)
  }

  const clearUnreadMessages = () => {
    setUnreadMessages([])
  }

  useEffect(() => {
    if (open === false) {
      const lastMessage = chat?.[0]

      if (lastMessage) {
        addUnreadMessage(lastMessage)
      }
    } else {
      clearUnreadMessages()
    }
  }, [chat])

  const toggleOpening = () => {
    const newOpenState = !open
    setOpen(newOpenState)

    if (newOpenState === true) {
      setHasUnreadMessage(false)
    }

    setTimeout(() => {
      if (newOpenState === false) {
        clearUnreadMessages()
      }
    }, 300)
  }

  const onMessageSent = () => {
    clearUnreadMessages()
  }

  return (
    <div className="absolute right-6 top-full z-[60] hidden md:flex items-center justify-end">
      <div
        className={`w-80 h-fit pb-2 bg-white shadow border-2 border-b-0 rounded-t-lg border-black flex flex-col items-center duration-300 transition-transform ease-in-out ${
          open ? "-translate-y-full" : "-translate-y-12"
        }`}
      >
        <button
          className="text-center text-black w-full px-4 py-2 transition-all duration-200 focus-visible:outline-black focus-visible:-outline-offset-4"
          onClick={toggleOpening}
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
        <div className="h-96 w-full flex flex-col  px-2">
          <ChatMessageList unreadMessages={unreadMessages} />
          <ChatForm chatOpen={open} onMessageSent={onMessageSent} />
        </div>
      </div>
    </div>
  )
}

export default Chat
