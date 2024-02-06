import { Button } from "@/components/ui/button"
import { useSkyjo } from "@/contexts/SkyjoContext"

const AdminLobby = () => {
  const { game, actions, player } = useSkyjo()

  if (game.admin.socketID === player.socketID && game.status === "lobby" && game.players.length > 1)
    return (
      <Button onClick={actions.startGame} className="mt-12">
        Start the game
      </Button>
    )
}

export default AdminLobby
