import { Card } from "@/components/Card"
import { useSkyjo } from "@/contexts/SkyjoContext"
import { canTurnTwoCards, isCurrentUserTurn } from "@/lib/skyjo"
import { cn } from "@/lib/utils"
import { SkyjoCardToJson } from "shared/types/skyjoCard"

type CardTableProps = {
  cards: SkyjoCardToJson[][]
  size?: "tiny" | "small" | "normal" | "big"
  cardDisabled?: boolean
}
const CardTable = ({
  cards,
  size = "normal",
  cardDisabled = false,
}: CardTableProps) => {
  const { game, player, actions } = useSkyjo()

  const onClick = (column: number, row: number) => {
    const canTurnCardAtBeginning =
      canTurnTwoCards(game) &&
      game.roundState === "waitingPlayersToTurnTwoCards"

    const replaceAfterTakingFromDrawPile = game.turnState === "replaceACard"
    const replaceAfterTakingFromDiscardPile =
      game.turnState === "throwOrReplace"

    if (canTurnCardAtBeginning) {
      actions.playRevealCard(column, row)
    } else if (isCurrentUserTurn(game, player.name)) {
      if (replaceAfterTakingFromDrawPile || replaceAfterTakingFromDiscardPile)
        actions.replaceCard(column, row)
      else if (game.turnState === "turnACard" && !cards[column][row].isVisible)
        actions.turnCard(column, row)
    }
  }

  return (
    <div
      className={cn(
        "grid grid-rows-3 grid-flow-col transition-all duration-300 gap-1.5 w-fit h-full aspect-[31/32]",
        size === "tiny" ? "max-h-40" : "max-h-[208px]",
      )}
    >
      {cards.map((column, columnIndex) => {
        return column.map((card, rowIndex) => (
          <Card
            key={`${columnIndex}-${rowIndex}`}
            card={card}
            size={size}
            onClick={() => onClick(columnIndex, rowIndex)}
            disabled={cardDisabled}
          />
        ))
      })}
    </div>
  )
}

export { CardTable }
