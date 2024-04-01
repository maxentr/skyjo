import { CardTable } from "@/components/CardTable"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { SkyjoPlayerToJson } from "shared/types/skyjoPlayer"

type PlayerBoardProps = {
  player: SkyjoPlayerToJson
  isPlayerTurn: boolean
}

const PlayerBoard = ({ player, isPlayerTurn }: PlayerBoardProps) => {
  const t = useTranslations("components")
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-end col-start-2 duration-300 ease-in-out w-full h-full",
      )}
    >
      <CardTable cards={player.cards} size="normal" />
      <Image
        src={`/avatars/${player.avatar}.png`}
        width={32}
        height={32}
        alt={t(`Avatar.${player.avatar}`)}
        title={t(`Avatar.${player.avatar}`)}
        className="mt-2 select-none"
        priority
      />
      <p
        className={cn(
          "text-center select-none text-sm",
          isPlayerTurn && "font-semibold",
        )}
      >
        {player.name} ({t("PlayerBoard.you")})
      </p>
    </div>
  )
}

export default PlayerBoard
