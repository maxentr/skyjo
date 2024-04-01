import { Card } from "@/components/Card"
import { useSkyjo } from "@/contexts/SkyjoContext"
import { canTurnTwoCards, hasTurnedCard, isCurrentUserTurn } from "@/lib/skyjo"
import { cn } from "@/lib/utils"
import { AnimatePresence } from "framer-motion"
import { SkyjoCardToJson } from "shared/types/skyjoCard"

type CardTableProps = {
  cards: SkyjoCardToJson[][]
  size?: "tiny" | "small" | "normal" | "big"
  cardDisabled?: boolean
  showSelectionAnimation?: boolean
}
const CardTable = ({
  cards,
  size = "normal",
  cardDisabled = false,
  showSelectionAnimation = false,
}: CardTableProps) => {
  const { game, player, actions } = useSkyjo()

  const canTurnCardsAtBeginning =
    canTurnTwoCards(game) && !hasTurnedCard(player)
  const canReplaceCard =
    game.turnState === "throwOrReplace" || game.turnState === "replaceACard"
  const canTurnCard = game.turnState === "turnACard"

  const onClick = (column: number, row: number) => {
    if (canTurnCardsAtBeginning) {
      actions.playRevealCard(column, row)
    } else if (isCurrentUserTurn(game, player.name)) {
      if (canReplaceCard) actions.replaceCard(column, row)
      else if (game.turnState === "turnACard" && !cards[column][row].isVisible)
        actions.turnCard(column, row)
    }
  }

  return (
    <div
      className={cn(
        "inline-grid grid-rows-3 grid-flow-col transition-all duration-300 gap-2 w-fit h-full aspect-[31/32] justify-center max-h-[208px]",
      )}
    >
      {cards.map((column, columnIndex) => {
        return column.map((card, rowIndex) => {
          const canBeSelected =
            ((canTurnCardAtBeginning || canTurnCard) && !card.isVisible) ||
            canReplaceCard
          return (
            <Card
              key={`${columnIndex}-${rowIndex}`}
              card={card}
              size={size}
              onClick={() => onClick(columnIndex, rowIndex)}
              className={
                showSelectionAnimation && canBeSelected
                  ? "animate-small-scale"
                  : ""
              }
              disabled={cardDisabled}
            />
          )
        })
      })}
    </div>
  )
}

export { CardTable }
