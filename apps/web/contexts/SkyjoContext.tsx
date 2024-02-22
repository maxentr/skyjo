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
import { SkyjoToJson } from "shared/types/skyjo"
import { SkyjoPlayerToJson } from "shared/types/skyjoPlayer"
import { PlayPickCard } from "shared/validations/play"

type SkyjoContextInterface = {
  game: SkyjoToJson
  player: SkyjoPlayerToJson
  opponents: SkyjoPlayerToJson[]
  actions: {
    startGame: () => void
    playRevealCard: (column: number, row: number) => void
    pickCardFromPile: (pile: PlayPickCard["pile"]) => void
    replaceCard: (column: number, row: number) => void
    discardSelectedCard: () => void
    turnCard: (column: number, row: number) => void
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

  const [game, setGame] = useState<SkyjoToJson>()

  const player = getCurrentUser(game?.players, username)
  const opponents = getOpponents(game?.players, username)

  useEffect(() => {
    if (!gameId) return

    initGameListeners()

    // get game
    socket.emit("get", gameId)

    return destroyGameListeners
  }, [socket, gameId])

  //#region listeners
  const onGameUpdate = async (game: SkyjoToJson) => {
    console.log("game updated", game)
    setGame(game)
  }

  const onPlayerLeave = async (
    game: SkyjoToJson,
    player: SkyjoPlayerToJson,
  ) => {
    console.log("player left", player)
    //TODO add system message in chat when chat is implemented
    setGame(game)
  }

  const initGameListeners = () => {
    socket.on("game", onGameUpdate)
    socket.on("playerLeave", onPlayerLeave)
  }
  const destroyGameListeners = () => {
    socket.off("game", onGameUpdate)
    socket.off("playerLeave", onPlayerLeave)
  }
  //#endregion

  if (!game || !player) return null

  //#region game actions
  const startGame = () => {
    socket.emit("start", {
      gameId: gameId,
    })
  }

  const playRevealCard = (column: number, row: number) => {
    socket.emit("play:reveal-card", {
      gameId: gameId,
      column: column,
      row: row,
    })
  }

  const pickCardFromPile = (pile: PlayPickCard["pile"]) => {
    socket.emit("play:pick-card", {
      gameId: gameId,
      pile,
    })
  }

  const replaceCard = (column: number, row: number) => {
    socket.emit("play:replace-card", {
      gameId: gameId,
      column: column,
      row: row,
    })
  }

  const discardSelectedCard = () => {
    socket.emit("play:discard-selected-card", {
      gameId: gameId,
    })
  }

  const turnCard = (column: number, row: number) => {
    socket.emit("play:turn-card", {
      gameId: gameId,
      column: column,
      row: row,
    })
  }

  const actions = {
    startGame,
    playRevealCard,
    pickCardFromPile,
    replaceCard,
    discardSelectedCard,
    turnCard,
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

export const useSkyjo = () => useContext(SkyjoContext)
export default SkyjoContextProvider
