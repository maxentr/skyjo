import GameLobbyButtons from "@/components/GameLobbyButtons"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useSkyjo } from "@/contexts/SkyjoContext"
import { useUser } from "@/contexts/UserContext"
import { useTranslations } from "next-intl"
import { CreatePlayer } from "shared/validations/player"

const GameStoppedDialog = () => {
  const { game } = useSkyjo()
  const { username, getAvatar } = useUser()
  const t = useTranslations("components.GameStoppedDialog")

  const isGameStopped = game.status === "stopped"

  if (!isGameStopped) return null

  const beforeButtonAction = () => {
    const player: CreatePlayer = {
      username,
      avatar: getAvatar(),
    }

    return player
  }

  return (
    <Dialog open={isGameStopped} data-testid="game-stopped-dialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">{t("title")}</DialogTitle>
          <DialogDescription className="mt-2 text-center">
            {t("description")}
          </DialogDescription>
        </DialogHeader>
        <GameLobbyButtons beforeButtonAction={beforeButtonAction} />
      </DialogContent>
    </Dialog>
  )
}

export default GameStoppedDialog
