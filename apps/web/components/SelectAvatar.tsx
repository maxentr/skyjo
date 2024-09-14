"use client"

import { AVATARS_ARRAY, useUser } from "@/contexts/UserContext"
import { cn } from "@/lib/utils"
import { AnimatePresence, m } from "framer-motion"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import UserAvatar from "./UserAvatar"

type SelectAvatarProps = {
  containerClassName?: string
}

const SelectAvatar = ({ containerClassName }: SelectAvatarProps) => {
  const { avatarIndex, setAvatarIndex, getAvatar } = useUser()

  const handlePrevious = () => {
    const newIndex =
      avatarIndex === 0 ? AVATARS_ARRAY.length - 1 : avatarIndex - 1

    setAvatarIndex(newIndex)
  }

  const handleNext = () => {
    const newIndex =
      avatarIndex === AVATARS_ARRAY.length - 1 ? 0 : avatarIndex + 1
    setAvatarIndex(newIndex)
  }

  return (
    <div className={cn("flex flex-row gap-2 items-center", containerClassName)}>
      <ChevronLeftIcon
        className="h-6 w-6 cursor-pointer dark:text-primary"
        onClick={handlePrevious}
      />
      <AnimatePresence mode="popLayout" initial={false}>
        <m.div
          key={avatarIndex}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ duration: 0.3 }}
        >
          <UserAvatar avatar={getAvatar()} />
        </m.div>
      </AnimatePresence>
      <ChevronRightIcon
        className="h-6 w-6 cursor-pointer dark:text-primary"
        onClick={handleNext}
      />
    </div>
  )
}

export default SelectAvatar
