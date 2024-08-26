"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useSocket } from "@/contexts/SocketContext"
import { useUser } from "@/contexts/UserContext"
import { useRouter } from "@/navigation"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { ERROR, GAME_STATUS } from "shared/constants"
import { SkyjoToJson } from "shared/types/skyjo"
import { CreatePlayer } from "shared/validations/player"

export type GameLobbyButtonAction =
  | "join"
  | "find"
  | "create-private"
  | "reconnect"
type GameLobbyButtonsProps = {
  gameCode?: string
  beforeButtonAction: (
    type: GameLobbyButtonAction,
  ) => Promise<CreatePlayer | undefined> | CreatePlayer | undefined
  hideReconnectButton?: boolean
}

const GameLobbyButtons = ({
  gameCode,
  beforeButtonAction,
  hideReconnectButton = false,
}: GameLobbyButtonsProps) => {
  const hasGameCode = !!gameCode

  const t = useTranslations("components.GameLobbyButtons")
  const { username } = useUser()
  const { socket, getLastGameIfPossible } = useSocket()
  const { toast } = useToast()
  const router = useRouter()

  const [loading, setLoading] = useState(false)

  const lastGame = getLastGameIfPossible()

  const handleButtons = async (type: GameLobbyButtonAction) => {
    if (socket === null) return
    setLoading(true)

    const player = await beforeButtonAction(type)
    if (!player) return

    if (type === "reconnect") {
      handleReconnection()
    } else if (type === "join")
      socket.emit("join", { gameCode: gameCode!, player })
    else socket.emit(type, player)

    const timeout = setTimeout(() => {
      toast({
        description: t("timeout.description"),
        variant: "destructive",
        duration: 5000,
      })
    }, 10000)

    socket.once("error:join", (message: string) => {
      clearTimeout(timeout)
      setLoading(false)

      if (message === ERROR.GAME_NOT_FOUND) {
        router.replace(`/`)
        toast({
          description: t("game-not-found.description"),
          variant: "destructive",
          duration: 5000,
        })
      }
    })

    socket.once("join", (game: SkyjoToJson, playerId: string) => {
      clearTimeout(timeout)

      localStorage.setItem(
        "lastGame",
        JSON.stringify({
          gameCode: game.code,
          playerId,
        }),
      )

      if (game.status === GAME_STATUS.LOBBY)
        router.replace(`/game/${game.code}/lobby`)
      else router.replace(`/game/${game.code}`)
    })
  }

  const handleReconnection = () => {
    if (socket === null) return

    delete lastGame?.maxDateToReconnect
    socket.emit("reconnect", lastGame!)

    socket.once("error:reconnect", (message: string) => {
      setLoading(false)

      if (message === ERROR.CANNOT_RECONNECT) {
        toast({
          description: t("cannot-reconnect.description"),
          variant: "destructive",
          duration: 5000,
        })
      }
    })
  }

  return (
    <div className="flex flex-col gap-2 mt-6">
      {lastGame && !hideReconnectButton && (
        <Button
          onClick={() => handleButtons("reconnect")}
          color="secondary"
          className="w-full mb-4"
          disabled={!username || socket === null}
          loading={loading}
        >
          {t("reconnect-game-button")}
        </Button>
      )}
      {hasGameCode && !lastGame && (
        <Button
          onClick={() => handleButtons("join")}
          color="secondary"
          className="w-full mb-4"
          disabled={!username || socket === null}
          loading={loading}
        >
          {t("join-game-button")}
        </Button>
      )}

      <Button
        onClick={() => handleButtons("find")}
        color="secondary"
        className="w-full"
        disabled={!username || socket === null}
        loading={loading}
      >
        {t("find-game-button")}
      </Button>
      <Button
        onClick={() => handleButtons("create-private")}
        className="w-full"
        disabled={!username || socket === null}
        loading={loading}
      >
        {t("create-private-game-button")}
      </Button>
    </div>
  )
}

export default GameLobbyButtons
