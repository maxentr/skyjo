"use client"

import RulesDialog from "@/components/RulesDialog"
import {
  PropsWithChildren,
  createContext,
  useContext,
  useMemo,
  useState,
} from "react"

type RulesContext = {
  openRules: () => void
  isRulesOpen: boolean
}
const RulesContext = createContext<RulesContext | undefined>(undefined)

const RulesProvider = ({ children }: PropsWithChildren) => {
  const [open, setOpen] = useState(false)

  const openRules = () => setOpen(true)

  const onOpenChange = (open: boolean) => {
    setOpen(open)
  }

  const value = useMemo(
    () => ({
      openRules,
      isRulesOpen: open,
    }),
    [],
  )

  return (
    <RulesContext.Provider value={value}>
      {children}
      <RulesDialog open={open} onOpenChange={onOpenChange} />
    </RulesContext.Provider>
  )
}

export const useRules = () => {
  const context = useContext(RulesContext)
  if (context === undefined) {
    throw new Error("useRules must be used within a RulesProvider")
  }
  return context
}

export default RulesProvider
