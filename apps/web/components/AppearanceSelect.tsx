"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"

const AppearanceSelect = () => {
  const t = useTranslations("components.Appearance")
  const { theme, setTheme } = useTheme()

  return (
    <Select value={theme} onValueChange={setTheme}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Theme" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="light">{t("light")}</SelectItem>
        <SelectItem value="dark">{t("dark")}</SelectItem>
        <SelectItem value="system">{t("system")}</SelectItem>
      </SelectContent>
    </Select>
  )
}

export { AppearanceSelect }
