import GamePage from "@/app/[locale]/game/[code]/GamePage"
import Lobby from "@/components/Lobby"
import SkyjoContextProvider from "@/contexts/SkyjoContext"

type GameServerPageProps = {
  params: {
    code: string
    locale: string
  }
}
const GameServerPage = ({ params }: GameServerPageProps) => {
  return (
    <SkyjoContextProvider gameCode={params.code}>
      <Lobby />
      <GamePage />
    </SkyjoContextProvider>
  )
}

export default GameServerPage
