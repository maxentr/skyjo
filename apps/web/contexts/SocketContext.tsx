"use client"

import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
} from "react"
import { ClientToServerEvents, ServerToClientEvents } from "shared/types/socket"
import { io, Socket } from "socket.io-client"

const socket = io(`${process.env.NEXT_PUBLIC_API_URL}`, {
  transports: ["websocket"],
  reconnectionDelay: 1000,
  reconnectionDelayMax: 20000,
  reconnectionAttempts: 3,
  autoConnect: true,
})

export type SkyjoSocket = Socket<ServerToClientEvents, ClientToServerEvents>

type SocketContextInterface = {
  socket: SkyjoSocket
}
const SocketContext = createContext({} as SocketContextInterface)

const SocketContextProvider = ({ children }: PropsWithChildren) => {
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
  }

  const initGameListeners = () => {
    socket.on("connect", onConnect)
    socket.on("disconnect", onConnectionLost)
  }
  const destroyGameListeners = () => {
    socket.off("connect", onConnect)
    socket.off("disconnect", onConnectionLost)
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
