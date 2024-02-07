"use client"

import { useSkyjo } from "@/contexts/SkyjoContext"
import { cn, getGameInviteLink } from "@/lib/utils"
import { ClassValue } from "clsx"
import { useState } from "react"

type Props = { className?: ClassValue }

const CopyLink = ({ className }: Props) => {
  const { game } = useSkyjo()
  const [copied, setCopied] = useState(false)

  const inviteLink = getGameInviteLink(window.location.href)

  const onCopy = () => {
    navigator.clipboard.writeText(inviteLink)

    setCopied(true)

    setTimeout(() => {
      setCopied(false)
    }, 3500)
  }

  if (game.status === "lobby")
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-2 w-fit",
          className,
        )}
      >
        <p
          className={cn(
            "px-2.5 py-1 w-fit bg-white text-slate-800 text-sm shadow rounded-md duration-300 transition-all select-none",
            copied
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-4 scale-[85%]",
          )}
        >
          Lien copié !
        </p>
        <div className="bg-white px-2 py-1 shadow rounded-md">
          <button
            className={cn("select-all text-sm text-slate-800")}
            onClick={onCopy}
          >
            {inviteLink}
          </button>
        </div>
      </div>
    )
}

export default CopyLink
