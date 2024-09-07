"use client"

import { Button } from "@/components/ui/button"
import { UserAgent, useUserAgent } from "@/hooks/useUserAgent"
import { BeforeInstallPromptEvent } from "@/types/beforeInstallPrompt"
import { AnimatePresence, m } from "framer-motion"
import { XIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useFeatureFlagEnabled } from "posthog-js/react"
import { useEffect, useState } from "react"
import { useLocalStorage } from "react-use"

const PWABanner = () => {
  const flagPwaBannerEnabled = useFeatureFlagEnabled("pwa-banner")

  const t = useTranslations("components.PWABanner")
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const { userAgent, isInstalled } = useUserAgent()
  const [hasBeenDismissed, setHasBeenDismissed] = useLocalStorage(
    "pwaBannerDismissed",
    false,
  )
  const [show, setShow] = useState(false)

  const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
    e.preventDefault()
    setDeferredPrompt(e)
  }

  useEffect(() => {
    if (!flagPwaBannerEnabled || typeof window === "undefined") return

    if (userAgent === "Chrome") {
      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }

    setShow(!isInstalled && !hasBeenDismissed && userAgent !== "unknown")

    return () => {
      if (userAgent === "Chrome") {
        window.removeEventListener(
          "beforeinstallprompt",
          handleBeforeInstallPrompt,
        )
      }
    }
  }, [flagPwaBannerEnabled, userAgent, isInstalled, hasBeenDismissed])

  const handleInstallation = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
        if (choiceResult.outcome === "accepted") {
          setShow(false)
        }
      })
    }
  }

  const handleDismiss = () => {
    setShow(false)
    setHasBeenDismissed(true)
  }

  if (!flagPwaBannerEnabled) return null

  return (
    <AnimatePresence>
      {show && (
        <m.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="z-[100] fixed bottom-4 left-4 right-4"
        >
          <div className="bg-white mx-auto px-4 pt-2 pb-2 rounded-xl border-2 border-black flex flex-col gap-1 max-w-2xl">
            <div className="flex flex-row items-end justify-between gap-2">
              <p className="text-black text-sm font-medium">{t("title")}</p>
              <XIcon onClick={handleDismiss} className="text-black" />
            </div>
            <div className="flex flex-row justify-between gap-2">
              <p className="text-black text-sm">
                {t(userAgent as Exclude<UserAgent, "unknown">)}
              </p>
              <div className="flex flex-row items-center gap-4 mb-1">
                {userAgent === "Chrome" && (
                  <Button
                    onClick={handleInstallation}
                    title={t("install-button.title")}
                  >
                    {t("install-button.content")}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  )
}

export default PWABanner
