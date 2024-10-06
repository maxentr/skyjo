"use client"

import UserAvatar from "@/components/UserAvatar"
import { Button } from "@/components/ui/button"
import {
  MotionTableHeader,
  MotionTableRow,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table"
import { useSkyjo } from "@/contexts/SkyjoContext"
import { getConnectedPlayers } from "@/lib/skyjo"
import { getRedirectionUrl } from "@/lib/utils"
import { useRouter } from "@/navigation"
import { AnimatePresence, m } from "framer-motion"
import { CheckCircle2Icon, XCircleIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { GAME_STATUS } from "shared/constants"
import { SkyjoPlayerToJson } from "shared/types/skyjoPlayer"

const ResultsPage = () => {
  const { player, game, actions } = useSkyjo()
  const router = useRouter()
  const t = useTranslations("pages.ResultsPage")
  const [visibleRows, setVisibleRows] = useState<SkyjoPlayerToJson[]>([])
  const sortedPlayers = [...game.players].sort((a, b) => b.score - a.score)

  const allRowsVisible = visibleRows.length >= sortedPlayers.length

  useEffect(() => {
    const interval = setInterval(() => {
      if (visibleRows.length < sortedPlayers.length) {
        const nextPlayer = sortedPlayers[visibleRows.length]

        if (nextPlayer) setVisibleRows((prev) => [nextPlayer, ...prev])
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [sortedPlayers, visibleRows.length])

  useEffect(() => {
    if (game.status === GAME_STATUS.STOPPED) return

    router.replace(getRedirectionUrl(game.code, game.status))
  }, [game.status])

  return (
    <AnimatePresence>
      <m.div
        className="h-dvh flex flex-col items-center justify-center overflow-auto sm:container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h1 className="text-2xl font-semibold mb-4">{t("title")}</h1>
        <Table className="border border-black bg-container lg:w-2/3 mx-auto">
          {allRowsVisible && (
            <MotionTableHeader
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, display: "table-header-group" }}
              transition={{ delay: 0.2 }}
            >
              <TableRow>
                <TableHead className="py-2 w-fit">{t("rank")}</TableHead>
                <TableHead className="py-2 w-52">{t("player")}</TableHead>
                <TableHead className="py-2">{t("score-per-round")}</TableHead>
                <TableHead className="py-2 text-right">{t("total")}</TableHead>
              </TableRow>
            </MotionTableHeader>
          )}
          <TableBody>
            {visibleRows.reverse().map((player, index) => (
              <MotionTableRow
                key={player.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5 }}
                className="border-b"
              >
                <TableCell className="w-8">
                  {allRowsVisible && visibleRows.length - 1 + index}
                </TableCell>
                <TableCell className="w-52 py-2 flex flex-row gap-2 items-center">
                  <UserAvatar player={player} size="small" />
                  <p className="text-sm text-ellipsis overflow-hidden whitespace-nowrap">
                    {player.name}
                  </p>
                </TableCell>
                <TableCell className="py-2">
                  {player.scores.join(" ; ")}
                </TableCell>
                <TableCell className="py-2 text-right">
                  {player.score}
                </TableCell>
              </MotionTableRow>
            ))}
          </TableBody>
        </Table>

        {allRowsVisible && (
          <m.div
            className="mt-2 flex flex-col items-center gap-4"
            initial={{ display: "none", opacity: 0 }}
            animate={{ opacity: 1, display: "flex" }}
            transition={{ delay: 1 }}
          >
            <div className="flex flex-col gap-1 items-center">
              <p>{t("player-want-to-replay")}</p>
              <div className="flex flex-row gap-1">
                {getConnectedPlayers(game.players).map((player) =>
                  player.wantsReplay ? (
                    <CheckCircle2Icon
                      key={player.id}
                      size={24}
                      className="text-emerald-600"
                    />
                  ) : (
                    <XCircleIcon key={player.id} size={24} />
                  ),
                )}
              </div>
            </div>
            <Button onClick={actions.replay} className="w-full">
              {player.wantsReplay
                ? t("replay-button.cancel")
                : t("replay-button.replay")}
            </Button>

            <Button onClick={actions.leave} className="w-full mt-6">
              {t("leave-button")}
            </Button>
          </m.div>
        )}
      </m.div>
    </AnimatePresence>
  )
}

export default ResultsPage
