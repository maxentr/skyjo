"use client"

import { Card } from "@/components/Card"
import { useSkyjo } from "@/contexts/SkyjoContext"
import { isCurrentUserTurn } from "@/lib/skyjo"
import { useTranslations } from "next-intl"

const DiscardPile = () => {
  const { game, player, actions } = useSkyjo()
  const t = useTranslations("components.DiscardPile")

  const onClick = () => {
    if (
      isCurrentUserTurn(game, player.name) &&
      game.lastDiscardCardValue !== undefined &&
      game.turnState === "chooseAPile"
    ) {
      actions.pickCardFromPile("discard")
    } else if (game.turnState === "throwOrReplace") {
      actions.discardSelectedCard()
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
      title={t("title")}
      className="shadow-md"
      disabled={disabled}
    />
  )
}

export default DiscardPile
