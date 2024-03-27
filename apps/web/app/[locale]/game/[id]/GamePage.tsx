"use client"

import AdminLobby from "@/components/AdminLobby"
import { Card } from "@/components/Card"
import Chat from "@/components/Chat"
import CopyLink from "@/components/CopyLink"
import DiscardPile from "@/components/DiscardPile"
import DrawPile from "@/components/DrawPile"
import EndGameDialog from "@/components/EndGameDialog"
import EndRoundDialog from "@/components/EndRoundDialog"
import OpponentBoard from "@/components/OpponentBoard"
import PlayerBoard from "@/components/PlayerBoard"
import RulesDialog from "@/components/RulesDialog"
import Scoreboard from "@/components/Scoreboard"
import { useSkyjo } from "@/contexts/SkyjoContext"
import { getGameInfo, isCurrentUserTurn } from "@/lib/skyjo"
import { InfoIcon } from "lucide-react"
import { useTranslations } from "next-intl"

type GamePageProps = {
  locale: string
}

const GamePage = ({ locale }: GamePageProps) => {
  const { game, player, opponents } = useSkyjo()
  const t = useTranslations("pages.GamePage")

  return (
    <div className="h-full w-full bg-background flex flex-col">
      <div className="w-full flex flex-row items-start h-1/3">
        <div className="w-10"></div>
        <div className="flex flex-1 flex-row justify-evenly">
          {opponents[1].map((opponent) => (
            <OpponentBoard
              opponent={opponent}
              key={opponent.socketId}
              isPlayerTurn={isCurrentUserTurn(game, opponent.name)}
            />
          ))}
        </div>
        <div className="flex flex-row justify-end">
          <div className="flex flex-col gap-4 items-center justify-start">
            <Scoreboard />
            <RulesDialog />
          </div>
        </div>
      </div>
      <div className="w-full h-1/3 grid grid-cols-3 grid-flow-row">
        <div className="flex flex-col items-start">
          {opponents[0].map((opponent) => (
            <OpponentBoard
              opponent={opponent}
              key={opponent.socketId}
              isPlayerTurn={isCurrentUserTurn(game, opponent.name)}
            />
          ))}
        </div>
        <div className="flex flex-col justify-center items-center gap-4">
          <div className="relative flex flex-row items-center gap-10">
            {game.selectedCard && (
              <Card
                card={game.selectedCard}
                className="absolute top-0 left-0 -rotate-[10deg] w-[70px] h-[100px] -translate-y-2 z-10"
                disabled
              />
            )}
            <DrawPile />
            <DiscardPile />
          </div>
          <AdminLobby />
        </div>
        <div className="flex flex-col items-end">
          {opponents[2].map((opponent) => (
            <OpponentBoard
              opponent={opponent}
              key={opponent.socketId}
              isPlayerTurn={isCurrentUserTurn(game, opponent.name)}
            />
          ))}
        </div>
      </div>
      <div className="w-full h-1/3 grid grid-cols-3 grid-flow-row items-end">
        <div className="flex flex-col gap-2">
          <CopyLink />
          <div className="flex flex-row items-center gap-2 p-2 bg-off-white border-2 border-black rounded w-[300px]">
            <InfoIcon size={20} />
            <div className="flex flex-col justify-start">
              {game.roundState === "lastLap" && (
                <p className="font-bold">{t("last-turn")}</p>
              )}
              <p>{getGameInfo(player, game)}</p>
            </div>
          </div>
        </div>
        {player && (
          <PlayerBoard
            player={player}
            isPlayerTurn={isCurrentUserTurn(game, player.name)}
          />
        )}
      </div>
      <EndRoundDialog />
      <EndGameDialog />
      <Chat />
    </div>
  )
}

export default GamePage
