"use client"

import FeedbackDialog from "@/components/FeedbackDialog"
import {
  PropsWithChildren,
  createContext,
  useContext,
  useMemo,
  useState,
} from "react"

type FeedbackContext = {
  openFeedback: () => void
}
const FeedbackContext = createContext<FeedbackContext | undefined>(undefined)

const FeedbackProvider = ({ children }: PropsWithChildren) => {
  const [open, setOpen] = useState(false)

  const openFeedback = () => {
    setOpen(true)
  }

  const value = useMemo(
    () => ({
      openFeedback,
    }),
    [],
  )

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <FeedbackDialog open={open} setOpen={setOpen} />
    </FeedbackContext.Provider>
  )
}

export const useFeedback = () => {
  const context = useContext(FeedbackContext)
  if (context === undefined) {
    throw new Error("useFeedback must be used within a FeedbackProvider")
  }
  return context
}

export default FeedbackProvider
