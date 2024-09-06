"use client"

import { useEffect, useState } from "react"

export type UserAgent =
  | "FirefoxIOS"
  | "FirefoxAndroid"
  | "ChromeIOS"
  | "ChromeAndroid"
  | "Chrome"
  | "SafariIOS"
  | "Safari"
  | "SamsungBrowser"
  | "unknown"

const useUserAgent = () => {
  const [userAgent, setUserAgent] = useState<UserAgent>("unknown")
  const [isInstalled, setIsInstalled] = useState<boolean>(false)

  const getUserAgent = () => {
    const ua = navigator.userAgent

    const isIOS = /iPhone|iPad|iPod/i.test(ua)
    const isAndroid = /Android/i.test(ua)

    const isFirefox = /Firefox/.test(ua)
    const isChrome = /Chrome/.test(ua)
    const isSafari = /Safari/.test(ua)
    const isSamsung = /SamsungBrowser/.test(ua)

    switch (true) {
      case isFirefox && isIOS:
        return "FirefoxIOS"
      case isFirefox && isAndroid:
        return "FirefoxAndroid"
      case /CriOS/.test(ua):
        return "ChromeIOS"
      case isChrome && isAndroid:
        return "ChromeAndroid"
      case isChrome:
        return "Chrome"
      case isSafari && isIOS:
        return "SafariIOS"
      case isSafari:
        return "Safari"
      case isSamsung:
        return "SamsungBrowser"
      default:
        return "unknown"
    }
  }

  useEffect(() => {
    if (window) {
      const userAgent = getUserAgent()
      setUserAgent(userAgent)

      setIsInstalled(window.matchMedia("(display-mode: standalone)").matches)
    }
  }, [])

  return { userAgent, isInstalled }
}

export { useUserAgent }
