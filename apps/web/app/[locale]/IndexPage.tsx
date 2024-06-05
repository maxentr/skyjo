"use client"

import GameLobbyButtons from "@/components/GameLobbyButtons"
import SelectAvatar from "@/components/SelectAvatar"
import { Input } from "@/components/ui/input"
import { useUser } from "@/contexts/UserContext"
import { useTranslations } from "next-intl"
import { CreatePlayer } from "shared/validations/player"

type Props = { gameId?: string }

const IndexPage = ({ gameId }: Props) => {
  const t = useTranslations("pages.Index")
  const { username, getAvatar, setUsername, saveUserInLocalStorage } = useUser()

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
        data-testid="username-input"
      />
      <GameLobbyButtons
        beforeButtonAction={beforeButtonAction}
        gameId={gameId}
      />
    </>
  )
}

export default IndexPage
