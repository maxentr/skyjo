"use client"

import { Card } from "@/components/Card"
import { useSkyjo } from "@/contexts/SkyjoContext"
import { isCurrentUserTurn } from "@/lib/skyjo"
import { useTranslations } from "next-intl"

const DRAW_CARD = {
  value: undefined,
  isVisible: false,
}

const DrawPile = () => {
  const { game, player, actions } = useSkyjo()
  const t = useTranslations("components.DrawPile")

  const onClick = () => {
    if (
      isCurrentUserTurn(game, player.name) &&
      game.turnState === "chooseAPile"
    ) {
      actions.pickCardFromPile("draw")
    }
  }

  return (
    <Card
      card={DRAW_CARD}
      onClick={onClick}
      title={t("title")}
      className="shadow-[4px_4px_0px_0px_rgba(0,0,0)]"
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
