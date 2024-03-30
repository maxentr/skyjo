"use client"

import { cn } from "@/lib/utils"
import { VariantProps, cva } from "class-variance-authority"
import { ClassValue } from "clsx"
import { Trash2Icon } from "lucide-react"
import { SkyjoCardToJson } from "shared/types/skyjoCard"

const cardClass = cva(
  "text-black border-2 border-black flex justify-center items-center transition-all duration-300 select-none",
  {
    variants: {
      size: {
        tiny: "w-8 h-12 border-[1.5px] rounded shadow-[0.75px_0.75px_0px_0px_rgba(0,0,0)] text-base",
        small:
          "w-12 h-16 rounded-md shadow-[1px_1px_0px_0px_rgba(0,0,0)] text-xl",
        normal:
          "w-14 h-20 rounded-lg shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0)] text-2xl ",
        big: "w-[70px] h-[100px] rounded-lg shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0)] text-3xl ",
      },
      value: {
        "discard": "bg-transparent border-dashed border-red-600 shadow-none",
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
        false: "hover:scale-105",
      },
    },
  },
)

const throwIconClass = cva("text-red-600", {
  variants: {
    size: {
      tiny: "w-4 h-4",
      small: " w-5 h-5",
      normal: " w-6 h-6",
      big: " w-8 h-8",
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
}
const Card = ({
  card,
  size = "normal",
  onClick,
  className,
  title,
  disabled = false,
}: CardProps) => {
  let cardContent: string | JSX.Element = ""

  if (card.value === -98) {
    cardContent = <Trash2Icon className={throwIconClass({ size })} />
  } else if (card.isVisible && card.value !== undefined) {
    cardContent = card.value.toString()
  }

  return (
    <button
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
    </button>
  )
}

export { Card }
