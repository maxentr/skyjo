"use client"

import { useFeedback } from "@/contexts/FeedbackContext"

type FeedbackLinkProps = {
  text: string
}

const FeedbackLink = ({ text }: FeedbackLinkProps) => {
  const { openFeedback } = useFeedback()

  return (
    <button
      onClick={openFeedback}
      className="text-slate-900 underline"
      data-testid="feedback-link"
    >
      {text}
    </button>
  )
}

export default FeedbackLink
