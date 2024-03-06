"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { locales } from "@/i18n"
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
    const gameId = query.get("gameId")

    if (gameId) {
      route = `${route}?gameId=${gameId}`
    }

    router.push(route, { locale })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="h-10 w-10 flex items-center justify-center">
        <LanguagesIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mx-2">
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
