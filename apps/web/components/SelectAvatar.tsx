"use client"

import { AVATARS, useUser } from "@/contexts/UserContext"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import UserAvatar from "./UserAvatar"

type Props = {
  containerClassName?: string
}

const SelectAvatar = ({ containerClassName }: Props) => {
  const { avatarIndex, setAvatarIndex, getAvatar } = useUser()

  const handlePrevious = () => {
    const newIndex = avatarIndex === 0 ? AVATARS.length - 1 : avatarIndex - 1

    setAvatarIndex(newIndex)
  }

  const handleNext = () => {
    const newIndex = avatarIndex === AVATARS.length - 1 ? 0 : avatarIndex + 1
    setAvatarIndex(newIndex)
  }

  return (
    <div className={`flex flex-row gap-2 items-center ${containerClassName}`}>
      <ChevronLeftIcon
        className="h-6 w-6 cursor-pointer dark:text-primary"
        onClick={handlePrevious}
      />
      <div className="flex flex-col gap-2">
        <UserAvatar avatar={getAvatar()} />
      </div>
      <ChevronRightIcon
        className="h-6 w-6 cursor-pointer dark:text-primary"
        onClick={handleNext}
      />
    </div>
  )
}

export default SelectAvatar
