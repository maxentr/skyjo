"use client"

import { useSkyjo } from "@/contexts/SkyjoContext"
import { isCurrentUserTurn } from "@/lib/skyjo"
import { AnimatePresence, m } from "framer-motion"
import { useTranslations } from "next-intl"
import { GAME_STATUS, ROUND_STATUS } from "shared/constants"

const GameInfo = () => {
  const { game, player } = useSkyjo()
  const t = useTranslations("utils.skyjo")

  const isPlayerTurn = isCurrentUserTurn(game, player?.socketId)

  const getGameInfo = () => {
    if (!player || !game) return t("waiting")

    if (
      game.status === GAME_STATUS.PLAYING &&
      game.roundStatus === ROUND_STATUS.WAITING_PLAYERS_TO_TURN_INITIAL_CARDS
    ) {
      return t("turn-cards", { number: game.settings.initialTurnedCount })
    }

    return t(`turn.${game.turnStatus}`)
  }

  return (
    <div className="absolute -top-8 text-center text-sm animate-scale">
      <AnimatePresence>
        {isPlayerTurn &&
          (game.roundStatus ===
            ROUND_STATUS.WAITING_PLAYERS_TO_TURN_INITIAL_CARDS ||
            game.roundStatus === ROUND_STATUS.PLAYING ||
            game.roundStatus === ROUND_STATUS.LAST_LAP) && (
            <m.p
              initial={{
                scale: 0,
              }}
              animate={{
                scale: 1,
                transition: {
                  duration: 0.3,
                  ease: "easeInOut",
                },
              }}
              exit={{
                scale: 0,
                transition: {
                  duration: 0.5,
                  ease: "easeInOut",
                },
              }}
            >
              {getGameInfo()}
            </m.p>
          )}
      </AnimatePresence>
    </div>
  )
}

export default GameInfo
