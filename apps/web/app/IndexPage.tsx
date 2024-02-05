"use client"

import SelectAvatar from "@/components/SelectAvatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSocket } from "@/contexts/SocketContext"
import { useUser } from "@/contexts/UserContext"
import { CreatePlayer } from "@/validations/player"
import { Shantell_Sans } from "next/font/google"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { SkyjoToJSON } from "shared/types/Skyjo"

const shantell = Shantell_Sans({ subsets: ["latin"], weight: "700" })

type Props = { gameId?: string }

const IndexPage = ({ gameId }: Props) => {
  const hasGameId = !!gameId
  const { username, avatar, setUsername, setAvatar, saveUserInLocalStorage } =
    useUser()
  const { connect } = useSocket()

  const router = useRouter()

  const [loading, setLoading] = useState(false)

  const handleButtons = (type: "join" | "find" | "createPrivate") => {
    setLoading(true)
    saveUserInLocalStorage()

    if (!username) return
    const socket = connect()

    const player: CreatePlayer = {
      username,
      avatar,
    }

    if (gameId && type === "join") socket.emit("join", { gameId, player })
    else socket.emit(type, { username, avatar })

    socket.on("joinGame", (game: SkyjoToJSON) => {
      setLoading(false)

      router.push(`/${game.id}`)
    })
  }

  return (
    <div className="flex h-dvh items-center justify-center bg-slate-200">
      <div className="bg-slate-300 border border-slate-600 px-16 py-12 rounded-xl w-3/6 max-w-2xl flex flex-col items-center">
        <h1
          className={
            "text-4xl text-center mb-5 text-slate-900 " + shantell.className
          }
        >
          Skyjo
        </h1>
        <SelectAvatar
          containerClassName="mb-4"
          initialValue={avatar}
          onChange={setAvatar}
        />
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
      </div>
    </div>
  )
}

export default IndexPage
