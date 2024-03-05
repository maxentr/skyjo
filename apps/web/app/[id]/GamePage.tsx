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
import Score from "@/components/Score"
import Settings from "@/components/Settings"
import { useSkyjo } from "@/contexts/SkyjoContext"
import { useSocket } from "@/contexts/SocketContext"
import { getGameInfo, isCurrentUserTurn } from "@/lib/skyjo"

const GamePage = () => {
  const { game, player, opponents } = useSkyjo()
  const { socket } = useSocket()

  return (
    <div className="relative h-dvh w-dvw p-4 bg-slate-100 flex flex-col">
      <div className="w-full h-2/5 flex flex-row">
        <div className="w-10"></div>
        <div className="absolute top-6 left-6 flex flex-col justify-start">
          {game.roundState === "lastLap" && (
            <p className="font-bold">Dernier tour !</p>
          )}
          <p>{getGameInfo(player, game)}</p>
        </div>
        <div className="h-2/5 flex flex-grow flex-row justify-evenly">
          {opponents.map((opponent) => (
            <OpponentBoard
              opponent={opponent}
              key={opponent.socketId}
              isPlayerTurn={isCurrentUserTurn(game, opponent.name)}
            />
          ))}
        </div>
        <div className="w-10 flex flex-col gap-2 items-end justify-start">
          <Settings />
          <Score />
        </div>
      </div>
      <div className="w-full h-1/5 grid grid-cols-3 grid-flow-row">
        <div className="col-start-2 flex flex-col justify-center items-center gap-4">
          <div className="flex flex-row items-center gap-10">
            <DrawPile />
            <DiscardPile />
          </div>
          <AdminLobby />
        </div>
        <div className="col-start-3 flex justify-end items-center">
          {game.selectedCard && (
            <div className="flex flex-col items-center justify-center gap-2">
              <Card card={game.selectedCard} disabled />
              <p>Carte sélectionnée</p>
            </div>
          )}
        </div>
      </div>
      <div className="w-full h-2/5 grid grid-cols-3 grid-flow-row items-end">
        <CopyLink />
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
