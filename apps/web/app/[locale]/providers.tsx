"use client"

import { Toaster } from "@/components/ui/toaster"
import SocketContextProvider from "@/contexts/SocketContext"
import UserContextProvider from "@/contexts/UserContext"
import { PropsWithChildren } from "react"

const Providers = ({ children }: PropsWithChildren) => {
  return (
    <SocketContextProvider>
      <UserContextProvider>{children}</UserContextProvider>
      <Toaster />
    </SocketContextProvider>
  )
}

export default Providers
