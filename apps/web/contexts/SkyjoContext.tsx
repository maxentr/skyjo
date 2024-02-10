"use client"

import { useSocket } from "@/contexts/SocketContext"
import { useUser } from "@/contexts/UserContext"
import { getCurrentUser, getOpponents } from "@/lib/skyjo"
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react"
import { SkyjotoJson } from "shared/types/Skyjo"
import { SkyjoPlayertoJson } from "shared/types/SkyjoPlayer"
import { PlaySkyjoActionTypeTakeFromPile } from "shared/validations/play"
import { Socket } from "socket.io-client"

type SkyjoContextInterface = {
  game: SkyjotoJson
  player: SkyjoPlayertoJson
  opponents: SkyjoPlayertoJson[]
  actions: {
    startGame: () => void
    turnCard: (column: number, row: number) => void
    takeCardFromPile: (actionType: PlaySkyjoActionTypeTakeFromPile) => void
    replaceCard: (column: number, row: number) => void
    throwSelectedCard: () => void
    turnCardAfterThrowing: (column: number, row: number) => void
  }
}

const SkyjoContext = createContext({} as SkyjoContextInterface)

interface SkyjoContextProviderProps extends PropsWithChildren {
  gameId: string
}

const SkyjoContextProvider = ({
  children,
  gameId,
}: SkyjoContextProviderProps) => {
  const { socket } = useSocket()
  const { username } = useUser()

  const [game, setGame] = useState<SkyjotoJson>()

  const player = getCurrentUser(game?.players, username)
  const opponents = getOpponents(game?.players, username)

  useEffect(() => {
    if (!socket || !gameId) return

    //#region init game listeners
    socket.on("game", onGameUpdate)
    //#endregion

    // get game
    socket.emit("get", gameId)

    return () => gameListenersDestroy(socket)
  }, [socket, gameId])

  //#region game listeners
  const onGameUpdate = async (game: SkyjotoJson) => {
    console.log("game update", game)
    setGame(game)
  }
  //#endregion

  if (!game || !player) return null

  //#region game actions
  const startGame = () => {
    socket?.emit("start", {
      gameId: gameId,
    })
  }

  const turnCard = (column: number, row: number) => {
    socket?.emit("turnCard", {
      gameId: gameId,
      playerId: player.socketId,
      column: column,
      row: row,
    })
  }

  const takeCardFromPile = (actionType: PlaySkyjoActionTypeTakeFromPile) => {
    socket?.emit("play", {
      gameId: gameId,
      playerId: player.socketId,
      actionType: actionType,
    })
  }

  const replaceCard = (column: number, row: number) => {
    socket?.emit("play", {
      gameId: gameId,
      playerId: player.socketId,
      actionType: "replace",
      column: column,
      row: row,
    })
  }

  const throwSelectedCard = () => {
    socket?.emit("play", {
      gameId: gameId,
      playerId: player.socketId,
      actionType: "throwSelectedCard",
    })
  }

  const turnCardAfterThrowing = (column: number, row: number) => {
    socket?.emit("play", {
      gameId: gameId,
      playerId: player.socketId,
      actionType: "turnACard",
      column: column,
      row: row,
    })
  }

  const actions = {
    startGame,
    turnCard,
    takeCardFromPile,
    replaceCard,
    throwSelectedCard,
    turnCardAfterThrowing,
  }
  //#endregion

  return (
    <SkyjoContext.Provider
      value={{
        game,
        player,
        opponents,
        actions,
      }}
    >
      {children}
    </SkyjoContext.Provider>
  )
}

const gameListenersDestroy = (socket: Socket) => {
  socket.off("game")
}

export const useSkyjo = () => useContext(SkyjoContext)
export default SkyjoContextProvider
