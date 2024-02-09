import ScoreTable from "@/components/ScoreTable"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useSkyjo } from "@/contexts/SkyjoContext"
import { useEffect, useState } from "react"

type EndRoundDialogProps = {}

const EndRoundDialog = ({}: EndRoundDialogProps) => {
  const { game } = useSkyjo()
  const [open, setOpen] = useState(false)

  const isRoundOver = game.roundState === "over" && game.status !== "finished"

  useEffect(() => {
    setOpen(isRoundOver)
  }, [isRoundOver])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">Fin de la manche</DialogTitle>
        </DialogHeader>
        <div className="mt-2">
          La manche suivante va commencer dans quelques secondes.
        </div>
        <ScoreTable players={game.players} />
      </DialogContent>
    </Dialog>
  )
}

export default EndRoundDialog
