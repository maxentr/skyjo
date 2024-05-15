"use client"

import { Card } from "@/components/Card"
import SelectedCard from "@/components/SelectedCard"
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
    <div className="relative">
      <SelectedCard show={game.turnState === "throwOrReplace"} />
      <Card
        card={DRAW_CARD}
        onClick={onClick}
        title={t("title")}
        className={cn("!shadow-[3px_3px_0px_0px_rgba(0,0,0)] !mdh:md:shadow-[4px_4px_0px_0px_rgba(0,0,0)]", animation)}
        disabled={!(isPlayerTurn && game.turnState === "chooseAPile")}
        flipAnimation={false}
      />
    </div>
  )
}

export default DrawPile
