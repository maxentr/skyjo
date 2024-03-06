"use client"

import withAuth from "@/components/withAuth"
import { PropsWithChildren } from "react"

const GameLayout = ({ children }: PropsWithChildren) => {
  return <>{children}</>
}

export default withAuth(GameLayout)
