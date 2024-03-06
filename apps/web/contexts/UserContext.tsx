"use client"

import React, {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { Avatar } from "shared/types/player"

const USERNAME_KEY = "username"
const AVATAR_KEY = "Avatar-index"

export const AVATARS: Avatar[] = [
  "bee",
  "crab",
  "dog",
  "elephant",
  "fox",
  "frog",
  "koala",
  "octopus",
  "penguin",
  "turtle",
  "whale",
]

type UserContextInterface = {
  username: string
  avatarIndex: number
  setUsername: Dispatch<SetStateAction<string>>
  setAvatarIndex: Dispatch<SetStateAction<number>>
  saveUserInLocalStorage: () => void
  getAvatar: () => Avatar
}

const UserContext = createContext({} as UserContextInterface)

const UserContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [username, setUsername] = useState<string>("")
  const [avatarIndex, setAvatarIndex] = useState<number>(0)

  useEffect(() => {
    if (localStorage) {
      const username = localStorage.getItem(USERNAME_KEY)
      const localAvatarIndex = localStorage.getItem(AVATAR_KEY)

      if (username) setUsername(username)
      if (localAvatarIndex) setAvatarIndex(+localAvatarIndex)
    }
  }, [])

  const getAvatar = () => {
    return AVATARS[avatarIndex] ?? AVATARS[0]
  }

  const saveUserInLocalStorage = () => {
    localStorage.setItem(USERNAME_KEY, username)
    localStorage.setItem(AVATAR_KEY, avatarIndex.toString())
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

export const useUser = () => useContext(UserContext)
export default UserContextProvider
