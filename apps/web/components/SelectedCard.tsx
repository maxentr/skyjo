import { Card } from "@/components/Card"
import { useSkyjo } from "@/contexts/SkyjoContext"
import { cn } from "@/lib/utils"
import { AnimatePresence, TargetAndTransition, motion } from "framer-motion"

type SelectedCardProps = {
  show: boolean
}

const SelectedCard = ({ show }: SelectedCardProps) => {
  const { game } = useSkyjo()

  const pickFromDrawPile = game.turnState === "throwOrReplace"

  let exit: TargetAndTransition = pickFromDrawPile
    ? {
        translateX: 92,
        rotate: "0deg",
        scale: 1,
      }
    : {
        translateX: -100,
      }

  return (
    <AnimatePresence>
      {game.selectedCard && show && (
        <motion.div
          className={cn(
            "absolute top-0 w-fit h-full z-10",
            pickFromDrawPile ? "left-0" : "right-0",
          )}
          initial={pickFromDrawPile ? { rotateY: 180 } : { rotateY: 0 }}
          animate={{
            rotateY: 0,
            transformStyle: "preserve-3d",
            transition: {
              duration: pickFromDrawPile ? 0.2 : 0.1,
            },
            rotate: pickFromDrawPile ? "-10deg" : "10deg",
            scale: 1.2,
          }}
        >
          <Card
            card={{
              value: undefined,
              isVisible: false,
            }}
            className="w-full h-full"
            size="normal"
            disabled
            flipAnimation={false}
          />
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
              transition: {
                duration: pickFromDrawPile ? 0.2 : 0,
                delay: pickFromDrawPile ? 0.1 : 0,
              },
            }}
          >
            <Card
              card={game.selectedCard}
              className="absolute top-0 left-0 w-full h-full"
              size="normal"
              disabled
              flipAnimation={false}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default SelectedCard
