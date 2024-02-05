import GamePage from "@/app/[id]/GamePage"
import SkyjoContextProvider from "@/contexts/SkyjoContext"

type GameServerPageProps = {
  params: {
    id: string
  }
}
const GameServerPage = ({ params }: GameServerPageProps) => {
  return (
    <SkyjoContextProvider gameId={params.id}>
      <GamePage />
    </SkyjoContextProvider>
  )
}

export default GameServerPage
