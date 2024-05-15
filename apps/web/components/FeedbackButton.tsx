"use client"

import { Button } from "@/components/ui/button"
import { useFeedback } from "@/contexts/FeedbackContext"
import { MessageSquareWarningIcon } from "lucide-react"
import { useTranslations } from "next-intl"

type FeedbackButtonProps = {
  className?: string
}

const FeedbackButton = ({ className }: FeedbackButtonProps) => {
  const { openFeedback } = useFeedback()
  const t = useTranslations("components.FeedbackButton")

  return (
    <Button
      onClick={openFeedback}
      variant="icon"
      aria-label={t("aria-label")}
      className={className}
    >
      <MessageSquareWarningIcon />
    </Button>
  )
}

export default FeedbackButton
