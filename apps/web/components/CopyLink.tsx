"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSkyjo } from "@/contexts/SkyjoContext"
import { getGameInviteLink } from "@/lib/utils"
import { CheckIcon, ClipboardCopyIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

const CopyLink = () => {
  const { game } = useSkyjo()
  const t = useTranslations("components.CopyLink")
  const [copied, setCopied] = useState(false)
  const [interval, setInterval] = useState<NodeJS.Timeout>()
  const inviteLink = getGameInviteLink(window.location.href)

  const onCopy = () => {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)

    if (copied) clearInterval(interval)
    setInterval(setTimeout(() => setCopied(false), 3000))
  }

  if (game.status === "lobby")
    return (
      <div className="flex flex-row items-center gap-2">
        <Input type="text" value={inviteLink} readOnly className="w-[300px]" />
        <Button variant="icon" onClick={onCopy}>
          {copied ? <CheckIcon /> : <ClipboardCopyIcon />}
        </Button>
      </div>
    )
}

export default CopyLink
