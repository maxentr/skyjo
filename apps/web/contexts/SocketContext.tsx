"use client"

import { useToast } from "@/components/ui/use-toast"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import { useTranslations } from "next-intl"
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import {
  CONNECTION_LOST_TIMEOUT_IN_MS,
  CONNECTION_STATUS,
} from "shared/constants"
import { ClientToServerEvents, ServerToClientEvents } from "shared/types/socket"
import { LastGame } from "shared/validations/reconnect"
import { Socket, io } from "socket.io-client"
import customParser from "socket.io-msgpack-parser"

dayjs.extend(utc)

const initSocket = (url: string) => {
  console.log("Connecting to", url)
  const socket = io(url, {
    autoConnect: true,
    parser: customParser,
  })

  return socket
}

export type SkyjoSocket = Socket<ServerToClientEvents, ClientToServerEvents>

type SocketContextInterface = {
  socket: SkyjoSocket | null
  createSocket: () => void
  getLastGameIfPossible: () => LastGame | null
  createLastGame: () => void
}
const SocketContext = createContext({} as SocketContextInterface)

const SocketContextProvider = ({ children }: PropsWithChildren) => {
  const { toast } = useToast()
  const t = useTranslations("contexts.SocketContext")

  const [socket, setSocket] = useState<SkyjoSocket | null>(null)

  useEffect(() => {
    if (socket === null) return

    initGameListeners()

    return () => {
      destroyGameListeners()
    }
  }, [socket])

  //#region reconnection
  const createLastGame = () => {
    if (typeof window === "undefined") return

    const lastGameString = localStorage.getItem("lastGame")
    if (!lastGameString) return
    const lastGame = JSON.parse(lastGameString) as LastGame

    const maxDateToReconnect = dayjs()
      .add(CONNECTION_LOST_TIMEOUT_IN_MS, "milliseconds")
      .format()

    localStorage.setItem(
      "lastGame",
      JSON.stringify({
        ...lastGame,
        maxDateToReconnect: maxDateToReconnect,
      } satisfies LastGame),
    )
  }

  const getLastGame = () => {
    if (typeof window === "undefined") return
    const lastGameString = localStorage.getItem("lastGame")

    if (!lastGameString) return null

    return JSON.parse(lastGameString) as LastGame
  }

  const getLastGameIfPossible = () => {
    const lastGame = getLastGame()

    if (!lastGame?.maxDateToReconnect) return null

    const nowUTC = dayjs().utc()
    const maxDateUTC = dayjs(lastGame.maxDateToReconnect).utc()

    const diff = maxDateUTC.diff(nowUTC, "seconds")
    const canReconnect = diff >= 0

    if (!canReconnect) localStorage.removeItem("lastGame")

    return canReconnect ? lastGame : null
  }
  //#endregion reconnection

  // const changeRegion = (regionTag: ApiRegionsTag, manual = false) => {
  //   const newUrl = getCurrentRegion(regionTag)?.url
  //   if (newUrl) {
  //     setSocket(initSocket(newUrl))
  //     setRegion(regionTag)

  //     if (manual) setPreferredRegion(regionTag)
  //   }
  // }

  const createSocket = async () => {
    setSocket(initSocket(process.env.NEXT_PUBLIC_API_URL!))
    // if region is specified in the url
    // if (regionTag) {
    //   changeRegion(regionTag)
    //   return
    // }

    // // if region is not specified in the url, use the preferred region
    // if (preferredRegion) changeRegion(preferredRegion)
    // else {
    //   // if no region is specified in the url and no preferred region is set, use the server with the lowest ping
    //   const serverWithLessPing = await getRegionWithLessPing()
    //   changeRegion(serverWithLessPing.tag)
    // }
  }

  //#region listeners
  const onConnect = () => {
    if (socket!.recovered) console.log("Socket reconnected")
    else console.log("Socket connected")
  }

  const onConnectionLost = (reason: string) => {
    console.log("Socket disconnected", reason)
    toast({
      description: t(CONNECTION_STATUS.CONNECTION_LOST),
      variant: "destructive",
      duration: 5000,
    })

    if (reason === "ping timeout") createLastGame()
  }

  const onConnectionError = (err: unknown) => {
    console.error("Socket error", err)
  }

  const initGameListeners = () => {
    socket!.on("connect", onConnect)
    socket!.on("disconnect", onConnectionLost)
    socket!.on("connect_error", onConnectionError)
  }
  const destroyGameListeners = () => {
    socket!.off("connect", onConnect)
    socket!.off("disconnect", onConnectionLost)
    socket!.off("connect_error", onConnectionError)
  }
  //#endregion

  const value = useMemo(
    () => ({
      socket,
      createSocket,
      createLastGame,
      getLastGameIfPossible,
    }),
    [socket],
  )

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)
export default SocketContextProvider
