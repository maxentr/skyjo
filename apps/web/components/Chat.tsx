"use client"

import ChatDrawer from "@/components/ChatDrawer"
import ChatForm from "@/components/ChatForm"
import ChatMessageList from "@/components/ChatMessageList"
import { useChat } from "@/contexts/ChatContext"
import { useSettings } from "@/contexts/SettingsContext"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { cn } from "@/lib/utils"
import { cva } from "class-variance-authority"
import { ClassValue } from "clsx"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"

const ChatNotificationVariant = cva("absolute rounded-full bg-red-400", {
  variants: {
    size: {
      small: "top-1.5 right-1.5 w-1 h-1",
      normal: "top-1.5 right-1.5 w-2 h-2",
      big: "top-1.5 right-1.5 w-3 h-3",
    },
  },
})

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
  const {
    settings: { chatVisibility, chatNotificationSize },
  } = useSettings()
  const t = useTranslations("components.Chat")
  const isDesktop = useMediaQuery("(min-width: 768px)")

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

  if (!chatVisibility) return null

  if (!isDesktop)
    return (
      <ChatDrawer
        className={className}
        open={open}
        toggleOpening={toggleOpening}
        disabled={disabled}
      />
    )

  return (
    <div
      className={cn(
        "absolute right-6 top-full z-10 flex items-center justify-end",
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
            <span
              className={ChatNotificationVariant({
                size: chatNotificationSize,
              })}
            />
            <span
              className={cn(
                ChatNotificationVariant({ size: chatNotificationSize }),
                "animate-ping",
              )}
            />
          </>
        )}
        <div className="h-96 w-full flex flex-col px-2">
          <ChatMessageList />
          <ChatForm chatOpen={open} />
        </div>
      </div>
    </div>
  )
}

export default Chat
