import { useTranslations } from "next-intl"
import Image from "next/image"
import { Avatar } from "shared/types/player"

type UserAvatarProps = {
  avatar?: Avatar
  pseudo?: string
  score?: number
  size?: "small" | "normal"
}

const UserAvatar = ({
  avatar,
  pseudo,
  score,
  size = "normal",
}: UserAvatarProps) => {
  const t = useTranslations("components.Avatar")

  return (
    <div
      className={`flex flex-col ${
        size === "small" ? "gap-0" : "gap-2"
      } items-center`}
    >
      {avatar ? (
        <Image
          src={`/avatars/${avatar}.png`}
          width={size === "small" ? 40 : 100}
          height={size === "small" ? 40 : 100}
          alt={t(avatar)}
          title={t(avatar)}
          className="select-none"
          priority
        />
      ) : (
        <div className="flex items-center justify-center w-[100px] h-[100px] bg-zinc-200 rounded-full">
          <p className="text-center text-2xl text-zinc-400">?</p>
        </div>
      )}
      {pseudo && (
        <p
          className={`text-slate-900 dark:text-primary text-center ${
            size === "small" ? "text-sm w-[80px]" : "text-lg w-[100px]"
          } text-ellipsis overflow-hidden whitespace-nowrap`}
        >
          {pseudo}
        </p>
      )}
      {typeof score === "number" && (
        <p className="text-slate-900 dark:text-primary text-center text-base w-[100px] text-ellipsis overflow-hidden whitespace-nowrap">
          {score}
        </p>
      )}
    </div>
  )
}

export default UserAvatar
