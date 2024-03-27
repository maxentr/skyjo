"use client"

import { cn } from "@/lib/utils"
import { cva } from "class-variance-authority"
import { ClassValue } from "clsx"
import { SkyjoCardToJson } from "shared/types/skyjoCard"

const cardClass = cva(
  "text-black border-2 border-black flex justify-center items-center transition-all duration-300 select-none",
  {
    variants: {
      size: {
        tiny: "w-8 h-12 border-[1.5px] rounded-md shadow-[0.75px_0.75px_0px_0px_rgba(0,0,0)] text-sm",
        small:
          "w-12 h-16 rounded-md shadow-[1px_1px_0px_0px_rgba(0,0,0)] text-base",
        normal:
          "w-14 h-20 rounded-lg shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0)] text-base",
        big: "w-[70px] h-[100px] rounded-lg shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0)] text-base",
      },
      value: {
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

type CardValue =
  | "no-card"
  | "not-visible"
  | "negative"
  | "neutral"
  | "low"
  | "medium"
  | "high"

const cardValue: Record<string, CardValue> = {
  "-99": "no-card",
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
  size?: "tiny" | "small" | "normal"
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
      {card.isVisible ? card.value : ""}
    </button>
  )
}

export { Card }
