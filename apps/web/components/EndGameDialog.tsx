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

type EndGameDialogProps = {}

const EndGameDialog = ({}: EndGameDialogProps) => {
  const { game } = useSkyjo()

  const isGameFinished =
    game.roundState === "over" && game.status === "finished"

  // Find the player with the lowest score
  if (!isGameFinished) return null

  const winner = getWinner(game)

  return (
    <Dialog open={isGameFinished}>
      <DialogContent allowClose={false}>
        <DialogHeader>
          <DialogTitle className="text-center">Partie terminée !</DialogTitle>
          <DialogDescription>
            <p className="mt-2">
              {winner.name} a gagné avec {winner.score} points !
            </p>
            <ScoreTable players={game.players} winner={winner} />
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

export default EndGameDialog
