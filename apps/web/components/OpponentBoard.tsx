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
      className={`flex flex-col items-center justify-start duration-300 ease-in-out ${
        isPlayerTurn ? "scale-105" : ""
      }`}
    >
      <Image
        src={`/avatars/${opponent.avatar}.png`}
        width={40}
        height={40}
        alt={opponent.avatar}
        className={`select-none ${isPlayerTurn && "animate-bounce-slow"}`}
        priority
      />
      <p
        className={cn(
          "text-center select-none text-sm mb-4",
          isPlayerTurn && "font-semibold",
        )}
      >
        {opponent.name}
      </p>
      <CardTable cards={opponent.cards} size="small" cardDisabled={true} />
    </div>
  )
}

export default OpponentBoard
