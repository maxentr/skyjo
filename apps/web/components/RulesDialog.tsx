"use client"

import Rules from "@/components/Rules"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useTranslations } from "next-intl"

type RulesDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const RulesDialog = ({ open, onOpenChange }: RulesDialogProps) => {
  const t = useTranslations("components.RulesDialog")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-2/3 px-0 bg-container">
        <DialogHeader className="px-6">
          <DialogTitle className="text-2xl">{t("title")}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-6 text-slate-900 bg-container overflow-y-auto">
          <Rules />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default RulesDialog
