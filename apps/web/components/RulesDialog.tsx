"use client"

import Rules from "@/components/Rules"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useSkyjo } from "@/contexts/SkyjoContext"
import { BookOpenIcon } from "lucide-react"
import { useTranslations } from "next-intl"

type RulesDialogProps = {
  defaultOpen?: boolean
  onOpenChange?: () => void
}

const RulesDialog = ({
  defaultOpen = false,
  onOpenChange,
}: RulesDialogProps) => {
  const { game } = useSkyjo()
  const t = useTranslations("components.RulesDialog")

  return (
    <Dialog defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="icon"
          aria-label={t("trigger.aria-label")}
          tabIndex={game?.status === "lobby" ? -1 : 0}
          data-testid="rules-button"
        >
          <BookOpenIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className="h-2/3 px-0 bg-off-white">
        <DialogHeader className="px-6">
          <DialogTitle className="text-2xl">{t("title")}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-6 text-slate-900 bg-off-white overflow-y-auto">
          <Rules />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default RulesDialog
