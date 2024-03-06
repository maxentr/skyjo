"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { usePathname, useRouter } from "@/navigation"
import { LanguagesIcon } from "lucide-react"
import { useSearchParams } from "next/navigation"

type LanguageSettingsProps = Readonly<{
  locale: string
}>

const LanguageSettings = ({ locale }: LanguageSettingsProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const query = useSearchParams()

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
          <DropdownMenuRadioItem value="en">English</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="fr">French</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default LanguageSettings
