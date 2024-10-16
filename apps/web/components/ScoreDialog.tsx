"use client"

import ScoreTable from "@/components/ScoreTable"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useSkyjo } from "@/contexts/SkyjoContext"
import { useTranslations } from "next-intl"
import { Dispatch, SetStateAction } from "react"

type ScoreDialogProps = {
  open: boolean
  onOpenChange: Dispatch<SetStateAction<boolean>>
}

const ScoreDialog = ({ open, onOpenChange }: ScoreDialogProps) => {
  const t = useTranslations("components.ScoreDialog")
  const { game } = useSkyjo()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">{t("title")}</DialogTitle>
        </DialogHeader>
        <ScoreTable players={game.players} />
      </DialogContent>
    </Dialog>
  )
}

export default ScoreDialog
