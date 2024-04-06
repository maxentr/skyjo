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
        "absolute -translate-y-2 z-10",
        game.turnState === "throwOrReplace"
          ? "top-5 -left-12 -rotate-[10deg]"
          : "top-5 -right-12 rotate-[10deg]",
      )}
      size="big"
      disabled
    />
  )
}

export default SelectedCard
