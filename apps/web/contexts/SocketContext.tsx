"use client"

import { useToast } from "@/components/ui/use-toast"
import { useTranslations } from "next-intl"
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
} from "react"
import { ClientToServerEvents, ServerToClientEvents } from "shared/types/socket"
import { Socket, io } from "socket.io-client"

const socket = io(`${process.env.NEXT_PUBLIC_API_URL}`, {
  autoConnect: true,
})

export type SkyjoSocket = Socket<ServerToClientEvents, ClientToServerEvents>

type SocketContextInterface = {
  socket: SkyjoSocket
}
const SocketContext = createContext({} as SocketContextInterface)

const SocketContextProvider = ({ children }: PropsWithChildren) => {
  const { toast } = useToast()
  const t = useTranslations("contexts.SocketContext")

  useEffect(() => {
    initGameListeners()

    return () => {
      destroyGameListeners()
    }
  }, [socket])

  //#region listeners
  const onConnect = () => {
    if (socket.recovered) console.log("Socket reconnected")
    else console.log("Socket connected")
  }

  const onConnectionLost = (reason: string) => {
    console.log("Socket disconnected", reason)
    toast({
      description: t("connection-lost"),
      variant: "destructive",
      duration: 5000,
    })
  }

  const onConnectionError = (err: unknown) => {
    console.error("Socket error", err)
  }

  const initGameListeners = () => {
    socket.on("connect", onConnect)
    socket.on("disconnect", onConnectionLost)
    socket.on("connect_error", onConnectionError)
  }
  const destroyGameListeners = () => {
    socket.off("connect", onConnect)
    socket.off("disconnect", onConnectionLost)
    socket.off("connect_error", onConnectionError)
  }
  //#endregion

  const value = useMemo(
    () => ({
      socket,
    }),
    [socket],
  )

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)
export default SocketContextProvider
