import { CardTable } from "@/components/CardTable"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { SkyjoPlayerToJSON } from "shared/types/SkyjoPlayer"

type PlayerBoardProps = {
  player: SkyjoPlayerToJSON
  isPlayerTurn: boolean
}

const PlayerBoard = ({ player, isPlayerTurn }: PlayerBoardProps) => {
  return (
    <div className="flex flex-col items-center justify-center absolute bottom-0 left-0 right-0 self-center z-10">
      <CardTable
        cards={player.cards}
        size={isPlayerTurn ? "normal" : "small"}
      />
      <Image
        src={`/avatars/${player.avatar}.png`}
        width={48}
        height={48}
        alt={player.avatar}
        className="mt-4 select-none"
        priority
      />
      <div
        className={cn(
          "text-center select-none",
          isPlayerTurn && "font-semibold",
        )}
      >
        {player.name} (Vous)
      </div>
    </div>
  )
}

export default PlayerBoard
