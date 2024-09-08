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
import { MESSAGE_TYPE } from "shared/constants"
import { ChatMessage } from "shared/types/chat"

type ChatContextInterface = {
  chat: ChatMessage[]
  unreadMessages: ChatMessage[]
  hasUnreadMessage: boolean
  setHasUnreadMessage: (hasUnreadMessage: boolean) => void
  addUnreadMessage: (message: ChatMessage) => void
  clearUnreadMessages: () => void
  setChat: (chat: ChatMessage[]) => void
  sendMessage: (message: string, username: string) => void
}

const ChatContext = createContext({} as ChatContextInterface)

const ChatContextProvider = ({ children }: PropsWithChildren) => {
  const { socket } = useSocket()
  const t = useTranslations("utils.server.messages")
  const [chat, setChat] = useState<ChatMessage[]>([])

  const [unreadMessages, setUnreadMessages] = useState<ChatMessage[]>([])
  const [hasUnreadMessage, setHasUnreadMessage] = useState<boolean>(false)

  useEffect(() => {
    if (socket) socket.on("message", onMessageReceived)

    return () => {
      if (socket) socket.off("message", onMessageReceived)
    }
  }, [socket])

  const sendMessage = (username: string, message: string) => {
    socket!.send({
      username,
      message,
    })
  }

  const onMessageReceived = (message: ChatMessage) => {
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

  return (
    <ChatContext.Provider
      value={{
        chat,
        unreadMessages,
        hasUnreadMessage,
        setHasUnreadMessage,
        addUnreadMessage,
        clearUnreadMessages,
        setChat,
        sendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export const useChat = () => useContext(ChatContext)

export default ChatContextProvider
