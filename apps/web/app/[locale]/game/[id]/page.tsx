import GamePage from "@/app/[locale]/game/[id]/GamePage"
import Lobby from "@/components/Lobby"
import SkyjoContextProvider from "@/contexts/SkyjoContext"

type GameServerPageProps = {
  params: {
    id: string
    locale: string
  }
}
const GameServerPage = ({ params }: GameServerPageProps) => {
  return (
    <SkyjoContextProvider gameId={params.id}>
      <Lobby />
      <GamePage />
    </SkyjoContextProvider>
  )
}

export default GameServerPage
