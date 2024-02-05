"use client"

import SocketContextProvider from "@/contexts/SocketContext"
import UserContextProvider from "@/contexts/UserContext"
import { PropsWithChildren } from "react"

const Providers = ({ children }: PropsWithChildren) => {
  return (
    <SocketContextProvider>
      <UserContextProvider>{children}</UserContextProvider>
    </SocketContextProvider>
  )
}

export default Providers
