import Image from "next/image"
import { Avatar } from "shared/types/Player"

type Props = {
  avatar?: Avatar
  pseudo?: string
  score?: number
}

const UserAvatar = ({ avatar, pseudo, score }: Props) => {
  return (
    <div className="flex flex-col gap-2 items-center">
      {avatar ? (
        <Image
          src={`/avatars/${avatar}.png`}
          width={100}
          height={100}
          alt={avatar}
          className="select-none"
          priority
        />
      ) : (
        <div className="flex items-center justify-center w-[100px] h-[100px] bg-zinc-200 rounded-full">
          <p className="text-center text-2xl text-zinc-400">?</p>
        </div>
      )}
      {pseudo && (
        <p className="text-customBlack dark:text-primary text-center text-lg w-[100px] text-ellipsis overflow-hidden whitespace-nowrap">
          {pseudo}
        </p>
      )}
      {typeof score === "number" && (
        <p className="text-customBlack dark:text-primary text-center text-base w-[100px] text-ellipsis overflow-hidden whitespace-nowrap">
          {score}
        </p>
      )}
    </div>
  )
}

export default UserAvatar
