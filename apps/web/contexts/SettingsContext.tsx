"use client"

import SettingsDialog from "@/components/SettingsDialog"
import { Locales } from "@/i18n"
import { usePathname, useRouter } from "@/navigation"
import { useSearchParams } from "next/navigation"
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react"
import { useLocalStorage } from "react-use"

export const ChatNotificationSize = {
  SMALL: "small",
  NORMAL: "normal",
  BIG: "big",
} as const
export type ChatNotificationSize =
  (typeof ChatNotificationSize)[keyof typeof ChatNotificationSize]

export const Appearance = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
} as const
export type Appearance = (typeof Appearance)[keyof typeof Appearance]

type Settings = {
  chatVisibility: boolean
  chatNotificationSize: ChatNotificationSize
  locale: Locales
  appearance: Appearance
  switchToPlayerWhoIsPlaying: boolean
}

type SettingsContext = {
  settings: Settings
  openSettings: () => void
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
    chatNotificationSize: ChatNotificationSize.NORMAL,
    appearance: Appearance.LIGHT,
    locale,
    switchToPlayerWhoIsPlaying: true,
  })

  const [open, setOpen] = useState(false)

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

  const openSettings = () => setOpen(true)

  const updateSetting = <K extends keyof Settings>(
    key: K,
    value: Settings[K],
  ) => {
    if (settings) {
      setSettings({ ...settings, [key]: value })
    }
  }

  return (
    <SettingsContext.Provider
      value={{ settings: settings!, openSettings, updateSetting }}
    >
      {children}
      <SettingsDialog open={open} onOpenChange={setOpen} />
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
