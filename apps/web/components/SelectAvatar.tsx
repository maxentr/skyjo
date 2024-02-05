"use client"

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { Dispatch, SetStateAction, useState } from "react"
import { Avatar } from "shared/types/Player"
import UserAvatar from "./UserAvatar"

const availableAvatars: Avatar[] = [
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

type Props = {
  onChange: Dispatch<SetStateAction<Avatar>>
  initialValue?: Avatar
  containerClassName?: string
}

const SelectAvatar = ({
  containerClassName,
  initialValue = "bee",
  onChange,
}: Props) => {
  const intialValueIndex =
    availableAvatars.findIndex((avatar) => avatar === initialValue) ?? 0
  const [index, setIndex] = useState(intialValueIndex)

  const handlePrevious = () => {
    const newIndex = index === 0 ? availableAvatars.length - 1 : index - 1
    setIndex(newIndex)

    onChange(availableAvatars[newIndex])
  }

  const handleNext = () => {
    const newIndex = index === availableAvatars.length - 1 ? 0 : index + 1
    setIndex(newIndex)

    onChange(availableAvatars[newIndex])
  }

  return (
    <div className={`flex flex-row gap-2 items-center ${containerClassName}`}>
      <ChevronLeftIcon
        className="h-6 w-6 cursor-pointer dark:text-primary"
        onClick={handlePrevious}
      />
      <div className="flex flex-col gap-2">
        <UserAvatar avatar={availableAvatars[index]} />
      </div>
      <ChevronRightIcon
        className="h-6 w-6 cursor-pointer dark:text-primary"
        onClick={handleNext}
      />
    </div>
  )
}

export default SelectAvatar
