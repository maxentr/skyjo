"use client"

import ChatForm from "@/components/ChatForm"
import ChatMessage from "@/components/ChatMessage"
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
    setUnreadMessages((prev) => [...prev, message])
    setHasUnreadMessage(true)
  }

  const clearUnreadMessages = () => {
    setUnreadMessages([])
  }

  useEffect(() => {
    if (open === false) {
      const lastMessage = chat[chat.length - 1]

      if (lastMessage) {
        addUnreadMessage(lastMessage)
      }
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
    <div className="absolute right-8 top-full z-10 flex items-center justify-end">
      <div
        className={`w-80 h-fit pb-2 bg-white shadow border-2 rounded-t-lg border-black flex flex-col items-center duration-300 transition-transform ease-in-out ${
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
          <hr className="w-full bg-black h-0.5" />
        </div>
        {hasUnreadMessage && (
          <>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-400" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-400 animate-ping" />
          </>
        )}
        <div className="h-96 w-full flex flex-col  px-2">
          <div className="overflow-y-auto flex flex-grow flex-col py-2 pr-2.5 -mr-2 gap-2">
            {chat
              .filter((message) => !unreadMessages.includes(message))
              .map((message) => (
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

            {unreadMessages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
          </div>
          <ChatForm chatOpen={open} onMessageSent={onMessageSent} />
        </div>
      </div>
    </div>
  )
}

export default Chat
