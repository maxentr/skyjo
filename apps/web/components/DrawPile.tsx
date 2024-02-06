"use client"

import { Card } from "@/components/Card"
import { useSkyjo } from "@/contexts/SkyjoContext"
import { isCurrentUserTurn } from "@/lib/skyjo"

const DRAW_CARD = {
  value: undefined,
  isVisible: false,
}

const DrawPile = () => {
  const { game, player, actions } = useSkyjo()
  const onClick = () => {
    if (
      isCurrentUserTurn(game, player.name) &&
      game.turnState === "chooseAPile"
    ) {
      actions.takeCardFromPile("takeFromDrawPile")
    }
  }

  return (
    <Card
      card={DRAW_CARD}
      onClick={onClick}
      title="Paquet de pioche"
      className="shadow-md"
      disabled={
        !(
          isCurrentUserTurn(game, player.name) &&
          game.turnState === "chooseAPile"
        )
      }
    />
  )
}

export default DrawPile
