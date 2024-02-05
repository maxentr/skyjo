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
import { Avatar } from "shared/types/Player"

const USERNAME_KEY = "username"
const AVATAR_KEY = "avatar"

type UserContextInterface = {
  username: string
  avatar: Avatar
  setUsername: Dispatch<SetStateAction<string>>
  setAvatar: Dispatch<SetStateAction<Avatar>>
  saveUserInLocalStorage: () => void
}

const UserContext = createContext({} as UserContextInterface)

const UserContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [username, setUsername] = useState<string>("")
  const [avatar, setAvatar] = useState<Avatar>("bee")

  useEffect(() => {
    if (localStorage) {
      const username = localStorage.getItem(USERNAME_KEY)
      const avatar = localStorage.getItem(AVATAR_KEY)

      if (username) setUsername(username)
      if (avatar) setAvatar(avatar as Avatar)
    }
  }, [])

  const saveUserInLocalStorage = () => {
    localStorage.setItem("username", username)
    localStorage.setItem("avatar", avatar)
  }

  const value = useMemo(
    () => ({
      username,
      avatar,
      setUsername,
      setAvatar,
      saveUserInLocalStorage,
    }),
    [username, avatar],
  )

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export const useUser = () => useContext(UserContext)
export default UserContextProvider
