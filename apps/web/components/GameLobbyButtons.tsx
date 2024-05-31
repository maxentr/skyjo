"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useSocket } from "@/contexts/SocketContext"
import { useUser } from "@/contexts/UserContext"
import { useRouter } from "@/navigation"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { ERROR } from "shared/constants"
import { SkyjoToJson } from "shared/types/skyjo"
import { CreatePlayer } from "shared/validations/player"

export type GameLobbyButtonAction = "join" | "find" | "create-private"
type GameLobbyButtonsProps = {
  gameId?: string
  beforeButtonAction: (
    type: GameLobbyButtonAction,
  ) => Promise<CreatePlayer | undefined> | CreatePlayer | undefined
}

const GameLobbyButtons = ({
  gameId,
  beforeButtonAction,
}: GameLobbyButtonsProps) => {
  const hasGameId = !!gameId

  const t = useTranslations("components.GameLobbyButtons")
  const { username } = useUser()
  const { socket } = useSocket()
  const { toast } = useToast()
  const router = useRouter()

  const [loading, setLoading] = useState(false)

  const handleButtons = async (type: GameLobbyButtonAction) => {
    setLoading(true)
    const player = await beforeButtonAction(type)
    if (!player) return

    if (gameId && type === "join") socket.emit("join", { gameId, player })
    else socket.emit(type, player)

    socket.once("error:join", (message: string) => {
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

    socket.once("join", (game: SkyjoToJson) => {
      setLoading(false)

      router.push(`/game/${game.id}`)
    })
  }

  return (
    <div className="flex flex-col gap-2 mt-6">
      {hasGameId && (
        <Button
          onClick={() => handleButtons("join")}
          color="secondary"
          className="w-full mb-4"
          disabled={!username || loading}
        >
          {t("join-game-button")}
        </Button>
      )}

      <Button
        onClick={() => handleButtons("find")}
        color="secondary"
        className="w-full"
        disabled={!username}
        loading={loading}
      >
        {t("find-game-button")}
      </Button>
      <Button
        onClick={() => handleButtons("create-private")}
        className="w-full"
        disabled={!username}
        loading={loading}
      >
        {t("create-private-game-button")}
      </Button>
    </div>
  )
}

export default GameLobbyButtons
