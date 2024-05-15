"use client"

import { useFeedback } from "@/contexts/FeedbackContext"

type FeedbackLinkProps = {
  text: string
}

const FeedbackLink = ({ text }: FeedbackLinkProps) => {
  const { openFeedback } = useFeedback()

  return (
    <button onClick={openFeedback} className="text-slate-900 underline">
      {text}
    </button>
  )
}

export default FeedbackLink
