"use client"

import { Button } from "@/components/ui/button"
import { useFeedback } from "@/contexts/FeedbackContext"
import { useSkyjo } from "@/contexts/SkyjoContext"
import { MessageSquareWarningIcon } from "lucide-react"
import { useTranslations } from "next-intl"

type FeedbackButtonProps = {
  className?: string
}

const FeedbackButton = ({ className }: FeedbackButtonProps) => {
  const { openFeedback } = useFeedback()
  const { game } = useSkyjo()
  const t = useTranslations("components.FeedbackButton")

  return (
    <Button
      onClick={openFeedback}
      variant="icon"
      aria-label={t("aria-label")}
      className={className}
      tabIndex={game?.status === "lobby" ? -1 : 0}
    >
      <MessageSquareWarningIcon />
    </Button>
  )
}

export default FeedbackButton
