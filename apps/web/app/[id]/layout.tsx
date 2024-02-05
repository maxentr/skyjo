"use client"

import withAuth from "@/components/withAuth"
import { PropsWithChildren } from "react"

const GameLayout = ({ children }: PropsWithChildren) => {
  return <>{children}</>
}

// Prevent anyone from accessing the game page directly
export default withAuth(GameLayout)
