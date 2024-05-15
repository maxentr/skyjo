"use client"

import { Card } from "@/components/Card"
import SelectedCard from "@/components/SelectedCard"
import { useSkyjo } from "@/contexts/SkyjoContext"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"

type DiscardPileProps = {
  isPlayerTurn: boolean
}

const DiscardPile = ({ isPlayerTurn }: DiscardPileProps) => {
  const { game, actions } = useSkyjo()
  const t = useTranslations("components.DiscardPile")

  const onClick = () => {
    if (
      isPlayerTurn &&
      game.lastDiscardCardValue !== undefined &&
      game.turnState === "chooseAPile"
    )
      actions.pickCardFromPile("discard")
  }

  const onDiscard = () => {
    if (isPlayerTurn) actions.discardSelectedCard()
  }

  if (isPlayerTurn && game.turnState === "throwOrReplace") {
    return (
      <Card
        card={{
          value: -98,
          isVisible: false,
        }}
        onClick={onDiscard}
        title={t("throw")}
        className="translate-y-1 animate-scale"
        disabled={false}
        flipAnimation={false}
      />
    )
  }

  const card = {
    value: game.lastDiscardCardValue ?? -99,
    isVisible: game.lastDiscardCardValue !== undefined,
  }

  const isPlayerTurnAndChooseAPile =
    isPlayerTurn && game.turnState === "chooseAPile"

  return (
    <div className="relative">
      <SelectedCard show={game.turnState === "replaceACard"} />
      <Card
        card={card}
        onClick={onClick}
        title={t("title")}
        className={cn(
          card.value === -99 ? "translate-y-1" : "translate-y-[2.5px]",
          isPlayerTurnAndChooseAPile ? "animate-scale" : "",
        )}
        disabled={!isPlayerTurnAndChooseAPile}
        flipAnimation={false}
      />
    </div>
  )
}

export default DiscardPile
