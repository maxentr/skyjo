import ScoreTable from "@/components/ScoreTable"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useSkyjo } from "@/contexts/SkyjoContext"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"

type EndRoundDialogProps = {}

const EndRoundDialog = ({}: EndRoundDialogProps) => {
  const { game } = useSkyjo()
  const t = useTranslations("components.EndRoundDialog")

  const [open, setOpen] = useState(false)

  const isRoundOver = game.roundState === "over" && game.status === "playing"

  useEffect(() => {
    setOpen(isRoundOver)
  }, [isRoundOver])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">{t("title")}</DialogTitle>
        </DialogHeader>
        <div className="mt-2 text-center">{t("description")}</div>
        <ScoreTable players={game.players} />
      </DialogContent>
    </Dialog>
  )
}

export default EndRoundDialog
