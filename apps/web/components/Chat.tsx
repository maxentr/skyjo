"use client"

import { ChatDesktopView } from "@/components/ChatDesktopView"
import { ChatMobileView } from "@/components/ChatMobileView"
import { useChat } from "@/contexts/ChatContext"
import { useSettings } from "@/contexts/SettingsContext"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { ClassValue } from "clsx"
import { useEffect, useState } from "react"

type ChatProps = {
  className?: ClassValue
  disabled?: boolean
}
const Chat = ({ className, disabled = false }: ChatProps) => {
  const { chat, setHasUnreadMessage, addUnreadMessage, clearUnreadMessages } =
    useChat()
  const {
    settings: { chatVisibility },
  } = useSettings()
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

  if (isDesktop) {
    return (
      <ChatDesktopView
        className={className}
        open={open}
        toggleOpening={toggleOpening}
        disabled={disabled}
      />
    )
  }

  return (
    <ChatMobileView
      className={className}
      open={open}
      toggleOpening={toggleOpening}
      disabled={disabled}
    />
  )
}

export { Chat }
