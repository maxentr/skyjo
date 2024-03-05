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
import { Dispatch, SetStateAction } from "react"
import { SkyjoPlayerToJson } from "shared/types/skyjoPlayer"

type ScoreDialogProps = {
  open: boolean
  onOpenChange: Dispatch<SetStateAction<boolean>>
}

const ScoreDialog = ({ open, onOpenChange }: ScoreDialogProps) => {
  const { game } = useSkyjo()

  let winner: SkyjoPlayerToJson | undefined
  const isGameFinished =
    game.roundState === "over" && game.status === "finished"

  if (isGameFinished) winner = getWinner(game)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">Score</DialogTitle>
          <DialogDescription>
            {winner && (
              <p className="mt-2">
                {winner.name} a gagné avec {winner.score} points !
              </p>
            )}
            <ScoreTable players={game.players} winner={winner} />
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

export default ScoreDialog
