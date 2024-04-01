"use client"

import { Card } from "@/components/Card"
import { useSkyjo } from "@/contexts/SkyjoContext"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"

const DRAW_CARD = {
  value: undefined,
  isVisible: false,
}

type DrawPileProps = {
  isPlayerTurn: boolean
}

const DrawPile = ({ isPlayerTurn }: DrawPileProps) => {
  const { game, actions } = useSkyjo()
  const t = useTranslations("components.DrawPile")

  const onClick = () => {
    if (isPlayerTurn && game.turnState === "chooseAPile") {
      actions.pickCardFromPile("draw")
    }
  }

  const animation =
    isPlayerTurn && game.turnState === "chooseAPile" ? "animate-scale" : ""

  return (
    <Card
      card={DRAW_CARD}
      onClick={onClick}
      title={t("title")}
      className={cn("shadow-[4px_4px_0px_0px_rgba(0,0,0)]", animation)}
      disabled={!(isPlayerTurn && game.turnState === "chooseAPile")}
    />
  )
}

export default DrawPile
