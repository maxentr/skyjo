"use client"

import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { io, Socket } from "socket.io-client"

type SocketContextInterface = {
  socket: Socket | undefined
  getSocket: () => Socket | undefined
  connect: () => Socket
}
const SocketContext = createContext({} as SocketContextInterface)

const SocketContextProvider = ({ children }: PropsWithChildren) => {
  const [socket, setSocket] = useState<Socket>()

  useEffect(() => {
    return () => {
      if (socket) socket.disconnect()
    }
  }, [socket])

  const connect = () => {
    if (socket) socket.disconnect()

    const newSocket = io(`${process.env.NEXT_PUBLIC_API_URL}/skyjo`, {
      transports: ["websocket"],
    })

    setSocket(newSocket)
    return newSocket
  }

  const getSocket = () => {
    if (socket) return socket
  }

  const value = useMemo(
    () => ({
      getSocket,
      socket,
      connect,
    }),
    [socket],
  )

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)
export default SocketContextProvider
