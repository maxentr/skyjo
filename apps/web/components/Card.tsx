"use client"

import { cn } from "@/lib/utils"
import { cva } from "class-variance-authority"
import { ClassValue } from "clsx"
import { SkyjoCardtoJson } from "shared/types/SkyjoCard"

const cardClass = cva(
  "border border-slate-900 flex justify-center items-center shadow-sm transition-all duration-300",
  {
    variants: {
      size: {
        small: "w-12 h-16 rounded",
        normal: "w-14 h-20 rounded-md",
      },
      value: {
        "no-card": "bg-transparent border-dashed",
        "not-visible": "bg-white",
        negative: "bg-indigo-500",
        neutral: "bg-sky-500",
        low: "bg-green-500",
        medium: "bg-yellow-500",
        high: "bg-red-500",
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
  card: SkyjoCardtoJson
  size?: "small" | "normal"
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
