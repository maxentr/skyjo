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
      <GamePage locale={params.locale} />
      <Lobby />
    </SkyjoContextProvider>
  )
}

export default GameServerPage
