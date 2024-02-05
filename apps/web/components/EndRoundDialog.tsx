import ScoreTable from "@/components/ScoreTable"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useSkyjo } from "@/contexts/SkyjoContext"

type EndRoundDialogProps = {}

const EndRoundDialog = ({}: EndRoundDialogProps) => {
  const { game } = useSkyjo()

  const isRoundOver = game.roundState === "over" && game.status !== "finished"

  return (
    <Dialog open={isRoundOver}>
      <DialogContent allowClose={false}>
        <DialogHeader>
          <DialogTitle className="text-center">Fin de la manche</DialogTitle>
          <DialogDescription>
              <p className="mt-2">La manche suivante va commencer dans quelques secondes.</p>
              <ScoreTable players={game.players} />
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

export default EndRoundDialog
