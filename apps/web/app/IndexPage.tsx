"use client"

import SelectAvatar from "@/components/SelectAvatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSocket } from "@/contexts/SocketContext"
import { useUser } from "@/contexts/UserContext"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { SkyjotoJson } from "shared/types/Skyjo"
import { CreatePlayer } from "shared/validations/player"

type Props = { gameId?: string }

const IndexPage = ({ gameId }: Props) => {
  const hasGameId = !!gameId
  const { username, getAvatar, setUsername, saveUserInLocalStorage } = useUser()
  const { connect } = useSocket()

  const router = useRouter()

  const [loading, setLoading] = useState(false)

  const handleButtons = (type: "join" | "find" | "createPrivate") => {
    setLoading(true)
    saveUserInLocalStorage()

    if (!username) return
    const socket = connect()

    const avatar = getAvatar()
    console.log(avatar)
    const player: CreatePlayer = {
      username,
      avatar: getAvatar(),
    }

    if (gameId && type === "join") socket.emit("join", { gameId, player })
    else socket.emit(type, player)

    socket.on("joinGame", (game: SkyjotoJson) => {
      setLoading(false)

      router.push(`/${game.id}`)
    })
  }

  return (
    <>
      <SelectAvatar containerClassName="mb-4" />
      <Input
        placeholder="Nom"
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
            Rejoindre la partie
          </Button>
        )}

        <Button
          onClick={() => handleButtons("find")}
          color="secondary"
          className="w-full"
          disabled={!username || loading}
        >
          Trouver une partie
        </Button>
        <Button
          onClick={() => handleButtons("createPrivate")}
          className="w-full"
          disabled={!username || loading}
        >
          Créer une partie privée
        </Button>
      </div>
    </>
  )
}

export default IndexPage
