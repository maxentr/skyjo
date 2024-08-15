"use client"

import withAuth from "@/components/withAuth"
import SkyjoContextProvider from "@/contexts/SkyjoContext"
import { PropsWithChildren } from "react"

type GameLayoutProps = PropsWithChildren & {
  params: {
    code: string
    locale: string
  }
}
const GameLayout = ({ children, params }: GameLayoutProps) => {
  return (
    <SkyjoContextProvider gameCode={params.code}>
      <div className="relative h-dvh !p-4 !md:p-6 bg-body overflow-hidden">
        {children}
      </div>
    </SkyjoContextProvider>
  )
}

export default withAuth(GameLayout)
