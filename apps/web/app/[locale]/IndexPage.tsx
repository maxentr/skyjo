"use client"

import SelectAvatar from "@/components/SelectAvatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useSocket } from "@/contexts/SocketContext"
import { useUser } from "@/contexts/UserContext"
import { useRouter } from "@/navigation"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { SkyjoToJson } from "shared/types/skyjo"
import { CreatePlayer } from "shared/validations/player"

type Props = { gameId?: string }

const IndexPage = ({ gameId }: Props) => {
  const hasGameId = !!gameId

  const t = useTranslations("pages.Index")
  const { username, getAvatar, setUsername, saveUserInLocalStorage } = useUser()
  const { socket } = useSocket()
  const { toast } = useToast()
  const router = useRouter()

  const [loading, setLoading] = useState(false)

  const handleButtons = (type: "join" | "find" | "create-private") => {
    setLoading(true)
    saveUserInLocalStorage()

    if (!username) return

    const player: CreatePlayer = {
      username,
      avatar: getAvatar(),
    }

    if (gameId && type === "join") socket.emit("join", { gameId, player })
    else socket.emit(type, player)

    socket.once("error:join", (message: string) => {
      setLoading(false)
      if (message === "game-not-found") {
        router.replace(`/`)
        toast({
          description: t("game-not-found.description"),
          variant: "destructive",
          duration: 3000,
        })
      }
    })

    socket.once("join", (game: SkyjoToJson) => {
      setLoading(false)

      router.push(`/${game.id}`)
    })
  }

  return (
    <>
      <SelectAvatar containerClassName="mb-4" />
      <Input
        placeholder={t("name-input-placeholder")}
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
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
          disabled={!username || loading}
        >
          {t("find-game-button")}
        </Button>
        <Button
          onClick={() => handleButtons("create-private")}
          className="w-full"
          disabled={!username || loading}
        >
          {t("create-private-game-button")}
        </Button>
      </div>
    </>
  )
}

export default IndexPage
