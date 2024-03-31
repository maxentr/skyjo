import { Card } from "@/components/Card"
import { useSkyjo } from "@/contexts/SkyjoContext"
import { cn } from "@/lib/utils"

const SelectedCard = () => {
  const { game } = useSkyjo()

  if (!game.selectedCard) return null

  return (
    <Card
      card={game.selectedCard}
      className={cn(
        "absolute top-0 -translate-y-2 z-10",
        game.turnState === "throwOrReplace"
          ? "left-0 -rotate-[10deg]"
          : "right-0 rotate-[10deg]",
      )}
      size="big"
      disabled
    />
  )
}

export default SelectedCard
