import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { useChat } from "@/contexts/ChatContext"
import { useSkyjo } from "@/contexts/SkyjoContext"
import { VariantProps, cva } from "class-variance-authority"
import { MessageSquareIcon, MessageSquareOffIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { Avatar } from "shared/constants"

const containerVariants = cva("flex flex-col items-center", {
  variants: {
    size: {
      small: " gap-0",
      normal: " gap-2",
    },
  },
  defaultVariants: {
    size: "normal",
  },
})

// Ajouter une sdh pour le mobile pour que la taille soit plus adaptée
const imageVariants = cva("select-none", {
  variants: {
    size: {
      small: " size-8 sm:size-10",
      normal: " size-12 sdh:sm:size-16 mdh:md:size-[6.25rem]",
    },
  },
  defaultVariants: {
    size: "normal",
  },
})

const textVariants = cva(
  "text-slate-900 dark:text-primary text-center text-ellipsis overflow-hidden whitespace-nowrap",
  {
    variants: {
      size: {
        small: "text-sm w-20",
        normal: "text-lg w-[6.25rem]",
      },
    },
    defaultVariants: {
      size: "normal",
    },
  },
)

interface UserAvatarProps extends VariantProps<typeof containerVariants> {
  avatar: Avatar
  username?: string
  allowContextMenu?: boolean
}

const UserAvatar = ({
  avatar,
  username,
  size = "normal",
  allowContextMenu = true,
}: UserAvatarProps) => {
  const t = useTranslations("components.Avatar")
  const tAvatar = useTranslations("utils.avatar")
  const { unmutePlayer, mutePlayer, mutedPlayers } = useChat()
  const { player } = useSkyjo()

  return (
    <ContextMenu>
      <ContextMenuTrigger
        disabled={!allowContextMenu || !username || player.name === username}
        className={containerVariants({ size })}
      >
        <Image
          src={`/avatars/${avatar}.png`}
          width={size === "small" ? 40 : 100}
          height={size === "small" ? 40 : 100}
          alt={tAvatar(avatar)}
          title={tAvatar(avatar)}
          className={imageVariants({ size })}
          priority
        />
        {username && <p className={textVariants({ size })}>{username}</p>}
      </ContextMenuTrigger>
      <ContextMenuContent>
        {mutedPlayers.includes(username!) ? (
          <ContextMenuItem onClick={() => unmutePlayer(username!)}>
            <MessageSquareIcon className="w-4 h-4 mr-2" />
            {t("context-menu.unmute")}
          </ContextMenuItem>
        ) : (
          <ContextMenuItem onClick={() => mutePlayer(username!)}>
            <MessageSquareOffIcon className="w-4 h-4 mr-2" />
            {t("context-menu.mute")}
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  )
}

export default UserAvatar
