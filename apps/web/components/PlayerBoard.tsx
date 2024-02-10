import { CardTable } from "@/components/CardTable"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { SkyjoPlayertoJson } from "shared/types/SkyjoPlayer"

type PlayerBoardProps = {
  player: SkyjoPlayertoJson
  isPlayerTurn: boolean
}

const PlayerBoard = ({ player, isPlayerTurn }: PlayerBoardProps) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center col-start-2 duration-300 ease-in-out",
        isPlayerTurn ? "scale-110" : "",
      )}
    >
      <CardTable cards={player.cards} size={"small"} />
      <Image
        src={`/avatars/${player.avatar}.png`}
        width={40}
        height={40}
        alt={player.avatar}
        className="mt-4 select-none"
        priority
      />
      <p
        className={cn(
          "text-center select-none text-sm",
          isPlayerTurn && "font-semibold",
        )}
      >
        {player.name} (Vous)
      </p>
    </div>
  )
}

export default PlayerBoard
