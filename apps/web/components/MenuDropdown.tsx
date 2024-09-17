"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useFeedback } from "@/contexts/FeedbackContext"
import { useRules } from "@/contexts/RulesContext"
import { useSettings } from "@/contexts/SettingsContext"
import {
  BookOpenIcon,
  MenuIcon,
  MessageSquareWarningIcon,
  SettingsIcon,
} from "lucide-react"
import { useTranslations } from "next-intl"

const MenuDropdown = () => {
  const { openFeedback } = useFeedback()
  const { openRules } = useRules()
  const { openSettings } = useSettings()
  const t = useTranslations("components.MenuDropdown")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="icon" aria-label={t("button.aria-label")}>
          <MenuIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mr-6">
        <DropdownMenuItem onClick={openRules}>
          <BookOpenIcon className="mr-2 h-4 w-4" />
          <span>{t("rules")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={openFeedback}>
          <MessageSquareWarningIcon className="mr-2 h-4 w-4" />
          <span>{t("feedback")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={openSettings}>
          <SettingsIcon className="mr-2 h-4 w-4" />
          <span>{t("settings")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default MenuDropdown
