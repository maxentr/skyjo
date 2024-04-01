"use client"

import { cn } from "@/lib/utils"
import { VariantProps, cva } from "class-variance-authority"
import { ClassValue } from "clsx"
import { motion, useAnimate, useAnimationControls } from "framer-motion"
import { Trash2Icon } from "lucide-react"
import { useEffect } from "react"
import { SkyjoCardToJson } from "shared/types/skyjoCard"

const cardClass = cva(
  "text-black border-2 border-black flex justify-center items-center select-none",
  {
    variants: {
      size: {
        tiny: " h-full max-h-12 aspect-[8/12] border-[1.5px] rounded shadow-[0.75px_0.75px_0px_0px_rgba(0,0,0)] text-base",
        small:
          " h-full max-h-16 aspect-[8/12] rounded-md shadow-[1px_1px_0px_0px_rgba(0,0,0)] text-xl",
        normal:
          " h-full max-h-20 aspect-[8/12] rounded-md shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0)] text-2xl ",
        big: "h-full max-h-[90px] aspect-[8/12] rounded-lg shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0)] text-3xl ",
      },
      value: {
        discard: "bg-transparent border-dashed border-red-600 shadow-none",
        "no-card": "bg-transparent border-dashed shadow-none",
        "not-visible": " bg-off-white",
        negative: " bg-card-dark-blue",
        neutral: " bg-card-light-blue",
        low: " bg-card-green",
        medium: " bg-card-yellow",
        high: " bg-card-red",
      },
      disabled: {
        true: "",
        false: "",
      },
    },
  },
)

const throwIconClass = cva("text-red-600", {
  variants: {
    size: {
      tiny: "w-4 aspect-square",
      small: " w-5 aspect-square",
      normal: " w-6 aspect-square",
      big: " w-8 aspect-square",
    },
  },
})

type CardValue =
  | "no-card"
  | "discard"
  | "not-visible"
  | "negative"
  | "neutral"
  | "low"
  | "medium"
  | "high"

const cardValue: Record<string, CardValue> = {
  "-99": "no-card",
  "-98": "discard",
  "not-visible": "not-visible",
  "-2": "negative",
  "-1": "negative",
  "0": "neutral",
  "1": "low",
  "2": "low",
  "3": "low",
  "4": "low",
  "5": "medium",
  "6": "medium",
  "7": "medium",
  "8": "medium",
  "9": "high",
  "10": "high",
  "11": "high",
  "12": "high",
}

type CardProps = {
  card: SkyjoCardToJson
  size?: VariantProps<typeof cardClass>["size"]
  onClick?: () => void
  className?: ClassValue
  title?: string
  disabled?: boolean
  flipAnimation?: boolean
}
const Card = ({
  card,
  size = "normal",
  onClick,
  className,
  title,
  disabled = false,
  flipAnimation = true,
}: CardProps) => {
  const [scope, animate] = useAnimate()
  const controls = useAnimationControls()

  useEffect(() => {
    const animation = async () => {
      await animate(scope.current, {
        rotateY: 360,
        transformStyle: "preserve-3d",
        transition: {
          duration: 1,
        },
      })

      controls.set({ rotateY: 0 })
    }

    if (flipAnimation && card.isVisible) animation()
  }, [flipAnimation, card.isVisible])

  let cardContent: string | JSX.Element = ""

  if (card.value === -98) {
    cardContent = <Trash2Icon className={throwIconClass({ size })} />
  } else if (card.isVisible && card.value !== undefined) {
    cardContent = card.value.toString()
  }

  return (
    <motion.button
      ref={scope}
      animate={controls}
      className={cn(
        cardClass({
          size,
          value: cardValue[card.value ?? "not-visible"],
          disabled,
        }),
        className,
      )}
      onClick={onClick}
      title={title}
      disabled={disabled}
    >
      {cardContent}
    </motion.button>
  )
}

export { Card }
