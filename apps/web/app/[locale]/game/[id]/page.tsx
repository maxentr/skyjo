import GamePage from "@/app/[locale]/game/[id]/GamePage"
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
    </SkyjoContextProvider>
  )
}

export default GameServerPage
