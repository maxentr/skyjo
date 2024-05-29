"use client"

import FeedbackDialog from "@/components/FeedbackDialog"
import {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from "react"

type FeedbackContextInterface = {
  openFeedback: () => void
}
const FeedbackContext = createContext({} as FeedbackContextInterface)

const FeedbackContextProvider = ({ children }: PropsWithChildren) => {
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

export const useFeedback = () => useContext(FeedbackContext)
export default FeedbackContextProvider
