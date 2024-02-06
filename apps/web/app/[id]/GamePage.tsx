"use client"

import { Card } from "@/components/Card"
import CopyLink from "@/components/CopyLink"
import DiscardPile from "@/components/DiscardPile"
import DrawPile from "@/components/DrawPile"
import EndGameDialog from "@/components/EndGameDialog"
import EndRoundDialog from "@/components/EndRoundDialog"
import OpponentBoard from "@/components/OpponentBoard"
import PlayerBoard from "@/components/PlayerBoard"
import ScoreSheet from "@/components/ScoreSheet"
import { useSkyjo } from "@/contexts/SkyjoContext"
import { getGameInfo, isCurrentUserTurn } from "@/lib/skyjo"

const GamePage = () => {
  const { game, player, opponents } = useSkyjo()

  return (
    <div className="h-dvh w-dvw p-6 bg-slate-100">
      <div className="relative w-full h-full">
        {player && (
          <PlayerBoard
            player={player}
            isPlayerTurn={isCurrentUserTurn(game, player.name)}
          />
        )}
        <div className="flex flex-row justify-evenly">
          {opponents.map((opponent) => (
            <OpponentBoard
              opponent={opponent}
              key={opponent.name}
              isPlayerTurn={isCurrentUserTurn(game, opponent.name)}
            />
          ))}
        </div>
        <div className="absolute right-0 top-1/2 z-10">
          {game.selectedCard && (
            <div className="flex flex-col items-center justify-center">
              <Card card={game.selectedCard} disabled />
              <p>Carte sélectionnée</p>
            </div>
          )}
        </div>
        <ScoreSheet players={game.players} />
        <div className="absolute top-0 right-0 z-10">
          {game.roundState === "lastLap" && (
            <p className="font-bold">Dernier tour !</p>
          )}
          <p>{getGameInfo(player, game)}</p>
        </div>
        <div className="absolute inset-0 flex flex-row justify-center items-center gap-10">
          <DrawPile />
          <DiscardPile />
        </div>
        {game.status === "lobby" && (
          <CopyLink className="absolute bottom-0 left-0 z-10" />
        )}
      </div>
      <EndRoundDialog />
      <EndGameDialog />
    </div>
  )
}

export default GamePage
