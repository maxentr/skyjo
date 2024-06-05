"use client"

import ScoreTable from "@/components/ScoreTable"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useSkyjo } from "@/contexts/SkyjoContext"
import { getWinner } from "@/lib/skyjo"
import { useTranslations } from "next-intl"
import { Dispatch, SetStateAction } from "react"
import { SkyjoPlayerToJson } from "shared/types/skyjoPlayer"

type ScoreDialogProps = {
  open: boolean
  onOpenChange: Dispatch<SetStateAction<boolean>>
}

const ScoreDialog = ({ open, onOpenChange }: ScoreDialogProps) => {
  const t = useTranslations("components.ScoreDialog")
  const { game } = useSkyjo()

  let winner: SkyjoPlayerToJson | undefined
  const isGameFinished =
    game.roundState === "over" && game.status === "finished"

  if (isGameFinished) winner = getWinner(game)

  return (
    <Dialog open={open} onOpenChange={onOpenChange} data-testid="score-dialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">{t("title")}</DialogTitle>
          {winner && (
            <DialogDescription className="mt-2">
              {t("description", {
                name: winner.name,
                score: winner.score,
              })}
            </DialogDescription>
          )}
        </DialogHeader>
        <ScoreTable players={game.players} winner={winner} />
      </DialogContent>
    </Dialog>
  )
}

export default ScoreDialog
