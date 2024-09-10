"use client"

import { Locales } from "@/i18n"
import { usePathname, useRouter } from "@/navigation"
import { useSearchParams } from "next/navigation"
import { PropsWithChildren, createContext, useContext, useEffect } from "react"
import { useLocalStorage } from "react-use"

type Settings = {
  chatVisibility: boolean
  locale: Locales
}

type SettingsContext = {
  settings: Settings
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void
}
const SettingsContext = createContext<SettingsContext | undefined>(undefined)

type SettingsProviderProps = PropsWithChildren<{ locale: Locales }>
const SettingsProvider = ({ children, locale }: SettingsProviderProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const query = useSearchParams()

  const [settings, setSettings] = useLocalStorage<Settings>("userSettings", {
    chatVisibility: true,
    locale,
  })

  useEffect(() => {
    let route = pathname
    const gameCode = query.get("gameCode")

    if (gameCode) {
      route += `?gameCode=${gameCode}`
    }

    if (settings) {
      router.push(route, { locale: settings.locale })
    }
  }, [settings?.locale])

  const updateSetting = <K extends keyof Settings>(
    key: K,
    value: Settings[K],
  ) => {
    if (settings) {
      setSettings((prev) => ({ ...prev!, [key]: value }))
    }
  }

  return (
    <SettingsContext.Provider value={{ settings: settings!, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}

export default SettingsProvider
