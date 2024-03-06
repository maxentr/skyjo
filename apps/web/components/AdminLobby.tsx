import { Button } from "@/components/ui/button"
import { useSkyjo } from "@/contexts/SkyjoContext"
import { useTranslations } from "next-intl"

const AdminLobby = () => {
  const { game, actions, player } = useSkyjo()
  const t = useTranslations("components.AdminLobby")

  if (
    game.admin.socketId === player.socketId &&
    game.status === "lobby" &&
    game.players.length > 1
  )
    return <Button onClick={actions.startGame}>{t("start-game-button")}</Button>
}

export default AdminLobby
