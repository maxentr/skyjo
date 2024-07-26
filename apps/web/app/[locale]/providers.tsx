"use client"

import { Toaster } from "@/components/ui/toaster"
import FeedbackContextProvider from "@/contexts/FeedbackContext"
import SocketContextProvider from "@/contexts/SocketContext"
import UserContextProvider from "@/contexts/UserContext"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { LazyMotion, domAnimation } from "framer-motion"
import posthog from "posthog-js"
import { PostHogProvider } from "posthog-js/react"
import { PropsWithChildren } from "react"

if (typeof window !== "undefined") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    person_profiles: "identified_only",
    persistence: "memory",
    capture_pageview: false,
    capture_pageleave: true,
  })
}
const Providers = ({ children }: PropsWithChildren) => {
  return (
    <PostHogProvider client={posthog}>
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
    </PostHogProvider>
  )
}

export default Providers
