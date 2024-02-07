"use client"

import { Card } from "@/components/Card"
import { useSkyjo } from "@/contexts/SkyjoContext"
import { isCurrentUserTurn } from "@/lib/skyjo"

const DiscardPile = () => {
  const { game, player, actions } = useSkyjo()
  const onClick = () => {
    if (
      isCurrentUserTurn(game, player.name) &&
      game.lastDiscardCardValue !== undefined &&
      game.turnState === "chooseAPile"
    ) {
      actions.takeCardFromPile("takeFromDiscardPile")
    } else if (game.turnState === "throwOrReplace") {
      actions.throwSelectedCard()
    }
  }

  const card = {
    value: game.lastDiscardCardValue ?? -99,
    isVisible: game.lastDiscardCardValue !== undefined,
  }

  const disabled = !(
    isCurrentUserTurn(game, player.name) &&
    (game.turnState === "chooseAPile" || game.turnState === "throwOrReplace")
  )
  return (
    <Card
      card={card}
      onClick={onClick}
      title="Paquet de défausse"
      className="shadow-md"
      disabled={disabled}
    />
  )
}

export default DiscardPile
