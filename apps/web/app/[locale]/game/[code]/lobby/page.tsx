import InactivityCheck from "./InactivityCheck"
import Lobby from "./Lobby"

type LobbyServerPageProps = {
  params: {
    code: string
    locale: string
  }
}

const LobbyServerPage = ({ params }: LobbyServerPageProps) => {
  return (
    <>
      <Lobby gameCode={params.code} />
      <InactivityCheck />
    </>
  )
}

export default LobbyServerPage
