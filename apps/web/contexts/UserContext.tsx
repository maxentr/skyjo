"use client"

import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { useLocalStorage } from "react-use"
import { AVATARS, Avatar } from "shared/constants"
import { createPlayer } from "shared/validations/player"

const USERNAME_KEY = "username"
const AVATAR_KEY = "Avatar-index"

export const AVATARS_ARRAY = Object.values(AVATARS)

type UserContext = {
  username: string
  avatarIndex: number
  setUsername: Dispatch<SetStateAction<string>>
  setAvatarIndex: Dispatch<SetStateAction<number>>
  saveUserInLocalStorage: () => void
  getAvatar: () => Avatar
}

const UserContext = createContext<UserContext | undefined>(undefined)

const UserProvider = ({ children }: PropsWithChildren) => {
  const [preferredUsername, setPreferredUsername] = useLocalStorage<string>(
    USERNAME_KEY,
    "",
    { raw: true },
  )
  const [preferredAvatarIndex, setPreferredAvatarIndex] =
    useLocalStorage<number>(AVATAR_KEY)

  const [username, setUsername] = useState<string>("")
  const [avatarIndex, setAvatarIndex] = useState<number>(0)

  useEffect(() => {
    if (localStorage) {
      if (preferredUsername) setUsername(preferredUsername)
      if (preferredAvatarIndex) setAvatarIndex(preferredAvatarIndex)
    }
  }, [preferredUsername, preferredAvatarIndex])

  const getAvatar = () => {
    return AVATARS_ARRAY[avatarIndex] ?? AVATARS_ARRAY[0]
  }

  const saveUserInLocalStorage = () => {
    const player = createPlayer.parse({ username, avatar: getAvatar() })
    setPreferredUsername(player.username)
    setPreferredAvatarIndex(avatarIndex)
  }

  const value = useMemo(
    () => ({
      username,
      avatarIndex,
      setUsername,
      setAvatarIndex,
      saveUserInLocalStorage,
      getAvatar,
    }),
    [username, avatarIndex],
  )

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}

export default UserProvider
