"use client"

import Chat from "@/components/Chat"
import DiscardPile from "@/components/DiscardPile"
import DrawPile from "@/components/DrawPile"
import EndGameDialog from "@/components/EndGameDialog"
import EndRoundDialog from "@/components/EndRoundDialog"
import FeedbackButton from "@/components/FeedbackButton"
import GameInfo from "@/components/GameInfo"
import GameStoppedDialog from "@/components/GameStoppedDialog"
import OpponentBoard from "@/components/OpponentBoard"
import OpponentsMobileView from "@/components/OpponentsMobileView"
import PlayerBoard from "@/components/PlayerBoard"
import RulesDialog from "@/components/RulesDialog"
import Scoreboard from "@/components/Scoreboard"
import { useSkyjo } from "@/contexts/SkyjoContext"
import { isCurrentUserTurn } from "@/lib/skyjo"
import { AnimatePresence, m } from "framer-motion"
import { useTranslations } from "next-intl"

const GamePage = () => {
  const { game, player, opponents } = useSkyjo()
  const t = useTranslations("pages.GamePage")

  const isPlayerTurn = isCurrentUserTurn(game, player?.socketId)
  const roundInProgress =
    game.roundState === "playing" || game.roundState === "lastLap"

  const isFirstPlayerGame = localStorage.getItem("firstGame") ?? "true"
  const onRulesDialogOpenChange = () => {
    if (isFirstPlayerGame) localStorage.setItem("firstGame", "false")
  }

  return (
    <div className="h-full w-full bg-body flex flex-col gap-6">
      <div className="w-full flex flex-row items-start h-full">
        {/* mobile */}
        <OpponentsMobileView />
        {/* desktop */}
        <div className="hidden md:block w-10"></div>
        <div className="hidden md:flex flex-1 flex-row justify-evenly w-full h-full">
          {opponents[1].map((opponent) => (
            <OpponentBoard
              opponent={opponent}
              key={opponent.socketId}
              isPlayerTurn={isCurrentUserTurn(game, opponent.socketId)}
            />
          ))}
        </div>
        <div className="flex flex-row justify-end">
          <div className="flex flex-col gap-4 items-center justify-start">
            <Scoreboard />
            <RulesDialog
              defaultOpen={isFirstPlayerGame === "true"}
              onOpenChange={onRulesDialogOpenChange}
            />
            <FeedbackButton className="mt-4" />
          </div>
        </div>
      </div>
      <div className="w-full h-full grid grid-cols-3 grid-flow-row">
        <div className="hidden md:flex flex-col items-start">
          {opponents[0].map((opponent) => (
            <OpponentBoard
              opponent={opponent}
              key={opponent.socketId}
              isPlayerTurn={isCurrentUserTurn(game, opponent.socketId)}
            />
          ))}
        </div>
        <div className="col-start-2 relative flex flex-col justify-center items-center gap-4">
          <div className="relative flex flex-row items-center justify-center gap-10 h-full max-h-20 w-fit">
            <AnimatePresence>
              {isPlayerTurn &&
                (game.roundState === "playing" ||
                  game.roundState === "lastLap") && (
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
                    className="absolute -top-8 text-center text-sm animate-scale"
                  >
                    {t("your-turn")}
                  </m.p>
                )}
            </AnimatePresence>
            <DrawPile isPlayerTurn={isPlayerTurn && roundInProgress} />
            <DiscardPile isPlayerTurn={isPlayerTurn && roundInProgress} />
          </div>
        </div>
        <div className="hidden md:flex flex-col items-end">
          {opponents[2].map((opponent) => (
            <OpponentBoard
              opponent={opponent}
              key={opponent.socketId}
              isPlayerTurn={isCurrentUserTurn(game, opponent.socketId)}
            />
          ))}
        </div>
      </div>
      <div className="w-full h-full grid grid-cols-3 grid-flow-row items-end">
        <div className="flex flex-col gap-2">
          <GameInfo />
        </div>

        {player && <PlayerBoard player={player} isPlayerTurn={isPlayerTurn} />}
      </div>
      <EndRoundDialog />
      <EndGameDialog />
      <GameStoppedDialog />
      <Chat disabled={game.status === "lobby"} />
    </div>
  )
}

export default GamePage
