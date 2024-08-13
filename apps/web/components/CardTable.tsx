import { Card } from "@/components/Card"
import { useSkyjo } from "@/contexts/SkyjoContext"
import {
  canTurnInitialCard,
  hasTurnedCard,
  isCurrentUserTurn,
} from "@/lib/skyjo"
import { cn } from "@/lib/utils"
import { AnimatePresence, m } from "framer-motion"
import { useEffect, useState } from "react"
import { ROUND_STATUS, TURN_STATUS } from "shared/constants"
import { SkyjoCardToJson } from "shared/types/skyjoCard"

type CardTableProps = {
  cards: SkyjoCardToJson[][]
  cardDisabled?: boolean
  showSelectionAnimation?: boolean
}
const CardTable = ({
  cards,
  cardDisabled = false,
  showSelectionAnimation = false,
}: CardTableProps) => {
  const { game, player, actions } = useSkyjo()
  const numberOfRows = cards?.[0]?.length
  const [numberOfRowsForClass, setNumberOfRowsForClass] = useState<number>(
    game.settings.cardPerRow,
  )

  const canTurnCardsAtBeginning =
    canTurnInitialCard(game) &&
    !hasTurnedCard(player, game.settings.initialTurnedCount)
  const canReplaceCard =
    game.turnStatus === TURN_STATUS.THROW_OR_REPLACE ||
    game.turnStatus === TURN_STATUS.REPLACE_A_CARD
  const canTurnCard = game.turnStatus === TURN_STATUS.TURN_A_CARD

  const onClick = (column: number, row: number) => {
    if (canTurnCardsAtBeginning) {
      actions.playRevealCard(column, row)
    } else if (isCurrentUserTurn(game, player.socketId)) {
      if (canReplaceCard) actions.replaceCard(column, row)
      else if (
        game.turnStatus === TURN_STATUS.TURN_A_CARD &&
        !cards[column][row].isVisible
      )
        actions.turnCard(column, row)
    }
  }

  // wait 2 seconds to set the number of rows (it's the time it takes for the animation to finish)
  useEffect(() => {
    if (numberOfRows === game.settings.cardPerRow)
      setNumberOfRowsForClass(game.settings.cardPerRow)
    setTimeout(() => {
      setNumberOfRowsForClass(numberOfRows)
    }, 1900)
  }, [numberOfRows, game.settings.cardPerRow])

  return (
    <m.div
      key={numberOfRowsForClass}
      initial={{ opacity: 0.9 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0.9 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "inline-grid grid-flow-col duration-100 gap-2 w-fit",
        numberOfRowsForClass
          ? `grid-rows-${numberOfRowsForClass}`
          : "grid-rows-3",
      )}
    >
      <AnimatePresence>
        {cards.map((column, columnIndex) => {
          return column.map((card, rowIndex) => {
            const canBeSelected =
              ((canTurnCardsAtBeginning || canTurnCard) && !card.isVisible) ||
              canReplaceCard
            return (
              <Card
                key={card.id}
                card={card}
                onClick={() => onClick(columnIndex, rowIndex)}
                className={
                  showSelectionAnimation && canBeSelected
                    ? "animate-small-scale"
                    : ""
                }
                disabled={cardDisabled || !canBeSelected}
                exitAnimation={
                  game.roundStatus === ROUND_STATUS.PLAYING ||
                  game.roundStatus === ROUND_STATUS.LAST_LAP
                }
              />
            )
          })
        })}
      </AnimatePresence>
    </m.div>
  )
}

export { CardTable }
