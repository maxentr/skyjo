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
    )
      actions.pickCardFromPile("discard")
  }

  const onDiscard = () => {
    if (isCurrentUserTurn(game, player.name)) actions.discardSelectedCard()
  }

  if (
    isCurrentUserTurn(game, player.name) &&
    game.turnState === "throwOrReplace"
  ) {
    return (
      <Card
        card={{
          value: -98,
          isVisible: false,
        }}
        onClick={onDiscard}
        title={t("throw")}
        className="translate-y-1"
        disabled={false}
      />
    )
  }

  const card = {
    value: game.lastDiscardCardValue ?? -99,
    isVisible: game.lastDiscardCardValue !== undefined,
  }

  const disabled = !(
    isCurrentUserTurn(game, player.name) && game.turnState === "chooseAPile"
  )

  return (
    <Card
      card={card}
      onClick={onClick}
      title={t("title")}
      className={card.value === -99 ? "translate-y-1" : "translate-y-[2.5px]"}
      disabled={disabled}
    />
  )
}

export default DiscardPile
