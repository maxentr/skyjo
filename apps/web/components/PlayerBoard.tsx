import { CardTable } from "@/components/CardTable"
import { useSkyjo } from "@/contexts/SkyjoContext"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { ROUND_STATUS, TURN_STATUS } from "shared/constants"
import { SkyjoPlayerToJson } from "shared/types/skyjoPlayer"

type PlayerBoardProps = {
  player: SkyjoPlayerToJson
  isPlayerTurn: boolean
}

const PlayerBoard = ({ player, isPlayerTurn }: PlayerBoardProps) => {
  const { game } = useSkyjo()
  const ta = useTranslations("utils.avatar")
  const tp = useTranslations("components.PlayerBoard")

  const showSelectionAnimation =
    game.roundStatus === ROUND_STATUS.WAITING_PLAYERS_TO_TURN_INITIAL_CARDS ||
    (isPlayerTurn &&
      (game.turnStatus === TURN_STATUS.TURN_A_CARD ||
        game.turnStatus === TURN_STATUS.REPLACE_A_CARD ||
        game.turnStatus === TURN_STATUS.THROW_OR_REPLACE))

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-end col-start-2 duration-300 ease-in-out w-full h-full",
      )}
    >
      <CardTable
        cards={player.cards}
        showSelectionAnimation={showSelectionAnimation}
      />
      <Image
        src={`/avatars/${player.avatar}.png`}
        width={32}
        height={32}
        alt={ta(player.avatar)}
        title={ta(player.avatar)}
        className={cn("mt-4 select-none", isPlayerTurn && "animate-bounce")}
        priority
      />
      <p
        className={cn(
          "text-center select-none text-sm",
          isPlayerTurn && "font-semibold",
        )}
      >
        {player.name} ({tp("you")})
      </p>
    </div>
  )
}

export default PlayerBoard
