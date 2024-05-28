"use client"

import CopyLink from "@/components/CopyLink"
import UserAvatar from "@/components/UserAvatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogOverlay } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import RadioNumber from "@/components/ui/radio-number"
import { Switch } from "@/components/ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useSkyjo } from "@/contexts/SkyjoContext"
import { cn } from "@/lib/utils"
import { LockIcon, UnlockIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { SKYJO_DEFAULT_SETTINGS } from "shared/constants"
import { ChangeSettings } from "shared/validations/changeSettings"

type ChangeSettingsKey = keyof ChangeSettings
type ChangeSettingsValue = ChangeSettings[ChangeSettingsKey]

const Lobby = () => {
  const t = useTranslations("components.Lobby")
  const {
    player,
    game: { players, status, settings, admin },
    actions,
  } = useSkyjo()

  const open = status === "lobby"
  const isAdmin = player.socketId == admin.socketId
  const hasMinPlayers = players.length < 2

  const changeSettings = (
    key: ChangeSettingsKey,
    value: ChangeSettingsValue,
  ) => {
    actions.changeSettings({
      ...settings,
      [key]: value,
    })
  }

  return (
    <Dialog open={open}>
      <DialogOverlay>
        <div className="fixed inset-0 z-20 flex items-center justify-center">
          <div className="flex flex-col gap-8 items-center">
            <div className="flex flex-row gap-4">
              <div className="bg-off-white border-2 border-black rounded-2xl px-12 py-8 w-[460px] relative">
                <span className="absolute top-4 right-4">
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger className="relative">
                        {settings.private ? (
                          <LockIcon
                            className={cn(
                              "h-6 w-6 text-slate-700",
                              !isAdmin && "cursor-default",
                            )}
                            onClick={() => changeSettings("private", false)}
                          />
                        ) : (
                          <UnlockIcon
                            className={cn(
                              "h-6 w-6 text-slate-500",
                              !isAdmin && "cursor-default",
                            )}
                            onClick={() => changeSettings("private", true)}
                          />
                        )}
                      </TooltipTrigger>
                      <TooltipContent>
                        {settings.private
                          ? t("settings.private.tooltip.on")
                          : t("settings.private.tooltip.off")}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </span>
                <h2 className="text-slate-900 text-center text-2xl mb-5">
                  {t("settings.title")}
                </h2>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-row items-center gap-2">
                    <Switch
                      id="skyjo-for-column"
                      checked={settings.allowSkyjoForColumn}
                      onCheckedChange={(checked) =>
                        changeSettings("allowSkyjoForColumn", checked)
                      }
                      disabled={!isAdmin}
                      title={t("settings.allow-skyjo-for-column")}
                    />
                    <Label htmlFor="skyjo-for-column">
                      {t("settings.allow-skyjo-for-column")}
                    </Label>
                  </div>
                  <div className="flex flex-row items-center gap-2">
                    <Switch
                      id="skyjo-for-row"
                      checked={settings.allowSkyjoForRow}
                      onCheckedChange={(checked) =>
                        changeSettings("allowSkyjoForRow", checked)
                      }
                      disabled={!isAdmin}
                      title={t("settings.allow-skyjo-for-row")}
                    />
                    <Label htmlFor="skyjo-for-row">
                      {t("settings.allow-skyjo-for-row")}
                    </Label>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="nb-columns">
                      {t("settings.nb-columns.label")}
                    </Label>
                    <RadioNumber
                      name="nb-columns"
                      max={SKYJO_DEFAULT_SETTINGS.cards.PER_COLUMN}
                      selected={settings.cardPerColumn}
                      onChange={(value) =>
                        changeSettings("cardPerColumn", value)
                      }
                      title={t("settings.nb-columns.title")}
                      disabled={!isAdmin}
                      disabledRadioNumber={settings.cardPerRow === 1 ? [1] : []}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="nb-rows">
                      {t("settings.nb-rows.label")}
                    </Label>
                    <RadioNumber
                      name="nb-rows"
                      max={SKYJO_DEFAULT_SETTINGS.cards.PER_ROW}
                      selected={settings.cardPerRow}
                      onChange={(value) => changeSettings("cardPerRow", value)}
                      title={t("settings.nb-rows.title")}
                      disabled={!isAdmin}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="initial-turned-count">
                      {t("settings.initial-turned-count.label")}
                    </Label>
                    <Input
                      type="number"
                      name={"initial-turned-count"}
                      max={settings.cardPerColumn * settings.cardPerRow}
                      value={settings.initialTurnedCount}
                      onChange={(e) =>
                        changeSettings("initialTurnedCount", +e.target.value)
                      }
                      title={t("settings.initial-turned-count.title", {
                        number: settings.initialTurnedCount,
                      })}
                      disabled={!isAdmin}
                    />
                  </div>
                </div>
                <div className="flex flex-row justify-center mt-8">
                  {isAdmin && (
                    <Button
                      onClick={actions.startGame}
                      disabled={hasMinPlayers}
                    >
                      {t("start-game-button")}
                    </Button>
                  )}
                </div>
              </div>
              <div className="hidden lg:block bg-off-white border-2 border-black rounded-2xl w-64 p-8">
                <h3 className="text-slate-900 text-center text-xl mb-5">
                  {t("player-section.title")}
                </h3>
                <div className="flex flex-row flex-wrap justify-center gap-2">
                  {players.map((player) => (
                    <UserAvatar
                      key={player.socketId}
                      avatar={player.avatar}
                      pseudo={player.name}
                      size="small"
                    />
                  ))}
                </div>
              </div>
            </div>
            <CopyLink />
          </div>
        </div>
      </DialogOverlay>
    </Dialog>
  )
}

export default Lobby
