import { CardTable } from "@/components/CardTable"
import { useSkyjo } from "@/contexts/SkyjoContext"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { SkyjoPlayerToJson } from "shared/types/skyjoPlayer"

type PlayerBoardProps = {
  player: SkyjoPlayerToJson
  isPlayerTurn: boolean
}

const PlayerBoard = ({ player, isPlayerTurn }: PlayerBoardProps) => {
  const { game } = useSkyjo()
  const ta = useTranslations("components.Avatar")
  const tp = useTranslations("components.PlayerBoard")

  const showSelectionAnimation =
    game.roundState === "waitingPlayersToTurnTwoCards" ||
    (isPlayerTurn &&
      (game.turnState === "turnACard" ||
        game.turnState === "replaceACard" ||
        game.turnState === "throwOrReplace"))

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-end col-start-2 duration-300 ease-in-out w-full h-full",
      )}
    >
      <CardTable
        cards={player.cards}
        size="normal"
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
