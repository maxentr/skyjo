"use client"

import { LanguageCombobox } from "@/components/LanguageCombobox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { ChatNotificationSize, useSettings } from "@/contexts/SettingsContext"
import { useTranslations } from "next-intl"
import { Dispatch, SetStateAction } from "react"

type SettingsDialogProps = {
  open: boolean
  onOpenChange: Dispatch<SetStateAction<boolean>>
}

const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const t = useTranslations("components.SettingsDialog")
  const { settings, updateSetting } = useSettings()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            {t("title")}
          </DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">{t("general")}</h2>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label>
                  {t("language")} ({t("language-warn")})
                </Label>
                <LanguageCombobox />
              </div>
              <div className="flex flex-col gap-2 opacity-50">
                <Label>{t("appearance")}</Label>
                <p className="text-sm">{t("comingSoon")}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">{t("chat")}</h2>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="chat-visibility">{t("chatVisibility")}</Label>
                <Switch
                  id="chat-visibility"
                  checked={settings.chatVisibility}
                  onCheckedChange={(value) =>
                    updateSetting("chatVisibility", value)
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>{t("chatNotificationSize")}</Label>
                <RadioGroup
                  value={settings.chatNotificationSize}
                  onValueChange={(value) =>
                    updateSetting(
                      "chatNotificationSize",
                      value as ChatNotificationSize,
                    )
                  }
                  disabled={!settings.chatVisibility}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="small" id="small" />
                    <Label htmlFor="small">{t("small")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="normal" id="normal" />
                    <Label htmlFor="normal">{t("normal")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="big" id="big" />
                    <Label htmlFor="big">{t("big")}</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SettingsDialog
