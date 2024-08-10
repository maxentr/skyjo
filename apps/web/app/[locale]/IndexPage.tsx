"use client"

import GameLobbyButtons from "@/components/GameLobbyButtons"
import SelectAvatar from "@/components/SelectAvatar"
import { Input } from "@/components/ui/input"
import { useSocket } from "@/contexts/SocketContext"
import { useUser } from "@/contexts/UserContext"
import { useTranslations } from "next-intl"
import { useEffect } from "react"
import { ApiRegionsTag } from "shared/constants"
import { CreatePlayer } from "shared/validations/player"

type Props = {
  searchParams: {
    gameCode?: string
    region?: ApiRegionsTag
  }
}

const IndexPage = ({ searchParams }: Props) => {
  const t = useTranslations("pages.Index")
  const { createSocket } = useSocket()
  const { username, getAvatar, setUsername, saveUserInLocalStorage } = useUser()

  useEffect(() => {
    createSocket(searchParams.region as ApiRegionsTag)
  }, [])

  const beforeButtonAction = () => {
    saveUserInLocalStorage()

    if (!username) return

    const player: CreatePlayer = {
      username,
      avatar: getAvatar(),
    }

    return player
  }

  return (
    <>
      <SelectAvatar containerClassName="mb-4" />
      <Input
        placeholder={t("name-input-placeholder")}
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <GameLobbyButtons
        beforeButtonAction={beforeButtonAction}
        gameCode={searchParams.gameCode}
      />
    </>
  )
}

export default IndexPage
