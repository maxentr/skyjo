import { CardTable } from "@/components/CardTable"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { SkyjoPlayerToJSON } from "shared/types/SkyjoPlayer"

type OpponentBoardProps = {
  opponent: SkyjoPlayerToJSON
  isPlayerTurn: boolean
}

const OpponentBoard = ({ opponent, isPlayerTurn }: OpponentBoardProps) => {
  return (
    <div
      className={`flex flex-col items-center justify-center z-10 duration-300 ${
        isPlayerTurn ? "scale-105" : ""
      }`}
    >
      <Image
        src={`/avatars/${opponent.avatar}.png`}
        width={48}
        height={48}
        alt={opponent.avatar}
        className={`select-none ${isPlayerTurn && "animate-bounce-slow"}`}
        priority
      />
      <div
        className={cn(
          "text-center select-none mb-4",
          isPlayerTurn && "font-semibold",
        )}
      >
        {opponent.name}
      </div>
      <CardTable cards={opponent.cards} size="small" cardDisabled={true} />
    </div>
  )
}

export default OpponentBoard
