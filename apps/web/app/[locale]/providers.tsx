"use client"

import { Toaster } from "@/components/ui/toaster"
import FeedbackContextProvider from "@/contexts/FeedbackContext"
import SocketContextProvider from "@/contexts/SocketContext"
import UserContextProvider from "@/contexts/UserContext"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { LazyMotion, domAnimation } from "framer-motion"
import { PropsWithChildren } from "react"

const Providers = ({ children }: PropsWithChildren) => {
  return (
    <>
      <Analytics />
      <SpeedInsights />
      <SocketContextProvider>
        <FeedbackContextProvider>
          <UserContextProvider>
            <LazyMotion strict features={domAnimation}>
              {children}
            </LazyMotion>
          </UserContextProvider>
          <Toaster />
        </FeedbackContextProvider>
      </SocketContextProvider>
    </>
  )
}

export default Providers
