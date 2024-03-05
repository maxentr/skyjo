import { CardTable } from "@/components/CardTable"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { AlertTriangleIcon } from "lucide-react"
import Image from "next/image"
import { SkyjoPlayerToJson } from "shared/types/skyjoPlayer"

type OpponentBoardProps = {
  opponent: SkyjoPlayerToJson
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
          "text-center select-none text-sm mb-4 flex flex-row items-center gap-1",
          isPlayerTurn && "font-semibold",
        )}
      >
        {opponent.name}
        {opponent.connectionStatus === "connection-lost" && (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger className="relative">
                <AlertTriangleIcon size={16} className="text-yellow-700" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Connexion instable</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </p>
      <CardTable cards={opponent.cards} size="small" cardDisabled={true} />
    </div>
  )
}

export default OpponentBoard
