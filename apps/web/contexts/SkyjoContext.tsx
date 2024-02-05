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
import { SkyjoToJSON } from "shared/types/Skyjo"
import { SkyjoPlayerToJSON } from "shared/types/SkyjoPlayer"
import { PlaySkyjoActionTypeTakeFromPile } from "shared/validations/play"
import { Socket } from "socket.io-client"

type SkyjoContextInterface = {
  game: SkyjoToJSON
  player: SkyjoPlayerToJSON
  opponents: SkyjoPlayerToJSON[]
  actions: {
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

  const [game, setGame] = useState<SkyjoToJSON>()

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
  const onGameUpdate = async (game: SkyjoToJSON) => {
    console.log("game update", game)
    setGame(game)
  }
  //#endregion

  if (!game || !player) return null

  //#region game actions
  const turnCard = (column: number, row: number) => {
    socket?.emit("turnCard", {
      gameId: gameId,
      playerId: player.socketID,
      cardColumnIndex: column,
      cardRowIndex: row,
    })
  }

  const takeCardFromPile = (actionType: PlaySkyjoActionTypeTakeFromPile) => {
    socket?.emit("play", {
      gameId: gameId,
      playerId: player.socketID,
      actionType: actionType,
    })
  }

  const replaceCard = (column: number, row: number) => {
    socket?.emit("play", {
      gameId: gameId,
      playerId: player.socketID,
      actionType: "replace",
      cardColumnIndex: column,
      cardRowIndex: row,
    })
  }

  const throwSelectedCard = () => {
    socket?.emit("play", {
      gameId: gameId,
      playerId: player.socketID,
      actionType: "throwSelectedCard",
    })
  }

  const turnCardAfterThrowing = (column: number, row: number) => {
    socket?.emit("play", {
      gameId: gameId,
      playerId: player.socketID,
      actionType: "turnACard",
      cardColumnIndex: column,
      cardRowIndex: row,
    })
  }

  const actions = {
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
