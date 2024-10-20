"use client"

import { Chat } from "@/components/Chat"
import withAuth from "@/components/withAuth"
import ChatProvider from "@/contexts/ChatContext"
import SkyjoProvider from "@/contexts/SkyjoContext"
import { VoteKickProvider } from "@/contexts/VoteKickContext"
import { PropsWithChildren } from "react"

type GameLayoutProps = PropsWithChildren & {
  params: {
    code: string
    locale: string
  }
}
const GameLayout = ({ children, params }: GameLayoutProps) => {
  return (
    <ChatProvider>
      <SkyjoProvider gameCode={params.code}>
        <VoteKickProvider>
          <div className="w-svh h-svh bg-body dark:bg-dark-body flex flex-row overflow-hidden">
            {children}
            <Chat className="z-40" />
          </div>
        </VoteKickProvider>
      </SkyjoProvider>
    </ChatProvider>
  )
}

export default withAuth(GameLayout)
