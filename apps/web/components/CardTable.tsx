import { Card } from "@/components/Card"
import { useSkyjo } from "@/contexts/SkyjoContext"
import { canTurnTwoCards, isCurrentUserTurn } from "@/lib/skyjo"
import { cn } from "@/lib/utils"
import { cva } from "class-variance-authority"
import { SkyjoCardtoJson } from "shared/types/SkyjoCard"

const sizeClass = cva(
  "grid grid-rows-3 grid-flow-col transition-all duration-300",
  {
    variants: {
      size: {
        small: "gap-1",
        normal: "gap-2",
      },
    },
  },
)

type CardTableProps = {
  cards: SkyjoCardtoJson[][]
  size?: "small" | "normal"
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
      actions.turnCard(column, row)
    } else if (isCurrentUserTurn(game, player.name)) {
      if (replaceAfterTakingFromDrawPile || replaceAfterTakingFromDiscardPile)
        actions.replaceCard(column, row)
      else if (game.turnState === "turnACard" && !cards[column][row].isVisible)
        actions.turnCardAfterThrowing(column, row)
    }
  }

  return (
    <div className={cn(sizeClass({ size }))}>
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
