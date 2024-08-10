"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Locales, locales } from "@/i18n"
import { usePathname, useRouter } from "@/navigation"
import { LanguagesIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useSearchParams } from "next/navigation"

type LanguageSettingsProps = Readonly<{
  locale: string
}>

const LanguageSettings = ({ locale }: LanguageSettingsProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const query = useSearchParams()
  const t = useTranslations("components.LanguageSettings")

  const handleLanguageChange = (locale: string) => {
    let route = pathname
    const gameCode = query.get("gameCode")

    if (gameCode) {
      route = `${route}?gameCode=${gameCode}`
    }

    router.push(route, { locale: locale as Locales })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="icon" aria-label={t("button.aria-label")}>
          <LanguagesIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mr-6">
        <DropdownMenuRadioGroup
          value={locale}
          onValueChange={handleLanguageChange}
        >
          {locales.map((locale) => (
            <DropdownMenuRadioItem key={locale} value={locale}>
              {t(locale)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default LanguageSettings
