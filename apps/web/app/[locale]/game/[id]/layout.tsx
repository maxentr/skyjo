"use client"

import withAuth from "@/components/withAuth"
import { PropsWithChildren } from "react"

const GameLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="relative h-dvh !p-6 bg-background overflow-hidden">
      {children}
    </div>
  )
}

export default withAuth(GameLayout)
