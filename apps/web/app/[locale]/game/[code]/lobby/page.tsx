import { posthogServer } from "@/lib/posthog-server"
import InactivityCheck from "./InactivityCheck"
import Lobby from "./Lobby"

type LobbyServerPageProps = {
  params: {
    code: string
    locale: string
  }
}

const LobbyServerPage = async ({ params }: LobbyServerPageProps) => {
  const isInactivityCheckEnabled = await posthogServer.isFeatureEnabled(
    "inactivity-check",
    "web-server",
  )
  return (
    <>
      <Lobby gameCode={params.code} />
      {isInactivityCheckEnabled && <InactivityCheck />}
    </>
  )
}

export default LobbyServerPage
