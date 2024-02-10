import { Button } from "@/components/ui/button"
import { useSkyjo } from "@/contexts/SkyjoContext"

const AdminLobby = () => {
  const { game, actions, player } = useSkyjo()

  if (game.admin.socketId === player.socketId && game.status === "lobby" && game.players.length > 1)
    return (
      <Button onClick={actions.startGame}>
        Start the game
      </Button>
    )
}

export default AdminLobby
