"use client"

import { Toaster } from "@/components/ui/toaster"
import FeedbackProvider from "@/contexts/FeedbackContext"
import RulesProvider from "@/contexts/RulesContext"
import SettingsProvider from "@/contexts/SettingsContext"
import SocketProvider from "@/contexts/SocketContext"
import UserProvider from "@/contexts/UserContext"
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
      <FeedbackProvider>
        <RulesProvider>
          <SettingsProvider>
            <SocketProvider>
              <FeedbackProvider>
                <UserProvider>
                  <LazyMotion strict features={domAnimation}>
                    {children}
                  </LazyMotion>
                </UserProvider>
                <Toaster />
              </FeedbackProvider>
            </SocketProvider>
          </SettingsProvider>
        </RulesProvider>
      </FeedbackProvider>
      <Toaster />
    </PostHogProvider>
  )
}

export default Providers
