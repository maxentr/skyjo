"use client"

import { useSocket } from "@/contexts/SocketContext"
import { useTranslations } from "next-intl"
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react"
import { MESSAGE_TYPE, SystemMessageType } from "shared/constants"
import { ChatMessage } from "shared/types/chat"

type ChatContext = {
  chat: ChatMessage[]
  unreadMessages: ChatMessage[]
  hasUnreadMessage: boolean
  setHasUnreadMessage: (hasUnreadMessage: boolean) => void
  addUnreadMessage: (message: ChatMessage) => void
  clearUnreadMessages: () => void
  setChat: (chat: ChatMessage[]) => void
  sendMessage: (message: string, username: string) => void
  addSystemMessage: (message: string) => void
  mutedPlayers: string[]
  mutePlayer: (username: string) => void
  unmutePlayer: (username: string) => void
  toggleMutePlayer: (username: string) => void
}

const ChatContext = createContext<ChatContext | undefined>(undefined)

const ChatProvider = ({ children }: PropsWithChildren) => {
  const { socket } = useSocket()
  const t = useTranslations("utils.chat")
  const [chat, setChat] = useState<ChatMessage[]>([])

  const [unreadMessages, setUnreadMessages] = useState<ChatMessage[]>([])
  const [hasUnreadMessage, setHasUnreadMessage] = useState<boolean>(false)

  const [mutedPlayers, setMutedPlayers] = useState<string[]>([])

  useEffect(() => {
    if (socket) socket.on("message", onMessageReceived)

    return () => {
      if (socket) socket.off("message", onMessageReceived)
    }
  }, [socket, mutedPlayers])

  const sendMessage = (username: string, message: string) => {
    socket!.send({
      username,
      message,
    })
  }

  const addSystemMessage = (
    message: string,
    type: Extract<
      SystemMessageType,
      "system-message" | "warn-system-message" | "error-system-message"
    > = MESSAGE_TYPE.SYSTEM_MESSAGE,
  ) => {
    const chatMessage = {
      id: crypto.randomUUID(),
      message,
      type,
    } as ChatMessage

    setChat((prev) => [chatMessage, ...prev])
  }

  const onMessageReceived = (message: ChatMessage) => {
    if (mutedPlayers.includes(message.username!)) return

    if (message.type === MESSAGE_TYPE.USER_MESSAGE) {
      setChat((prev) => [message, ...prev])
    } else {
      const messageContent = t(message.message, {
        username: message.username,
      })

      setChat((prev) => [
        {
          id: message.id,
          username: undefined,
          message: messageContent,
          type: message.type,
        } as ChatMessage,
        ...prev,
      ])
    }
  }

  const addUnreadMessage = (message: ChatMessage) => {
    setUnreadMessages((prev) => [message, ...prev])
    setHasUnreadMessage(true)
  }

  const clearUnreadMessages = () => setUnreadMessages([])

  //#region Mute functionality
  const mutePlayer = (username: string) => {
    if (!username) {
      addSystemMessage(
        t("argument-required", { command: "/mute" }),
        MESSAGE_TYPE.WARN_SYSTEM_MESSAGE,
      )
    } else if (mutedPlayers.includes(username)) {
      addSystemMessage(t("player-already-muted", { username }))
    } else {
      setMutedPlayers((prev) => [...prev, username])
      addSystemMessage(t("player-muted", { username }))
    }
  }

  const unmutePlayer = (username: string) => {
    if (!username) {
      addSystemMessage(
        t("argument-required", { command: "/unmute" }),
        MESSAGE_TYPE.WARN_SYSTEM_MESSAGE,
      )
    } else if (!mutedPlayers.includes(username)) {
      addSystemMessage(t("player-not-muted", { username }))
    } else {
      setMutedPlayers((prev) => prev.filter((user) => user !== username))
      addSystemMessage(t("player-unmuted", { username }))
    }
  }

  const toggleMutePlayer = (username: string) => {
    setMutedPlayers((prev) =>
      prev.includes(username)
        ? prev.filter((user) => user !== username)
        : [...prev, username],
    )
  }
  //#endregion

  return (
    <ChatContext.Provider
      value={{
        chat,
        unreadMessages,
        hasUnreadMessage,
        setHasUnreadMessage,
        addUnreadMessage,
        addSystemMessage,
        clearUnreadMessages,
        setChat,
        sendMessage,
        mutedPlayers,
        mutePlayer,
        unmutePlayer,
        toggleMutePlayer,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export const useChat = () => {
  const context = useContext(ChatContext)
  if (!context) throw new Error("useChat must be used within a ChatProvider")
  return context
}

export default ChatProvider
