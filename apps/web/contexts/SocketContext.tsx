"use client"

import { useToast } from "@/components/ui/use-toast"
import { getCurrentRegion, getRegionWithLessPing } from "@/lib/utils"
import { useTranslations } from "next-intl"
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { ApiRegionsTag } from "shared/constants"
import { ClientToServerEvents, ServerToClientEvents } from "shared/types/socket"
import { Socket, io } from "socket.io-client"
import customParser from "socket.io-msgpack-parser"

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
  region: ApiRegionsTag | null
  changeRegion: (region: ApiRegionsTag, manual?: boolean) => void
  createSocket: (region?: ApiRegionsTag) => void
}
const SocketContext = createContext({} as SocketContextInterface)

const SocketContextProvider = ({ children }: PropsWithChildren) => {
  const { toast } = useToast()
  const t = useTranslations("contexts.SocketContext")

  const [socket, setSocket] = useState<SkyjoSocket | null>(null)
  const [region, setRegion] = useState<ApiRegionsTag | null>(null)

  useEffect(() => {
    if (socket === null) return

    initGameListeners()

    return () => {
      destroyGameListeners()
    }
  }, [socket])

  const changeRegion = (regionTag: ApiRegionsTag, manual = false) => {
    const newUrl = getCurrentRegion(regionTag)?.url
    if (newUrl) {
      setSocket(initSocket(newUrl))
      setRegion(regionTag)

      if (manual) {
        localStorage.setItem("preferredRegion", regionTag)
      }
    }
  }

  const createSocket = async (regionTag?: ApiRegionsTag) => {
    // if region is specified in the url
    if (regionTag) {
      changeRegion(regionTag)
      return
    }

    // if region is not specified in the url, use the preferred region
    const preferredRegion = localStorage.getItem(
      "preferredRegion",
    ) as ApiRegionsTag | null

    if (preferredRegion) {
      changeRegion(preferredRegion)
    } else {
      // if no region is specified in the url and no preferred region is set, use the server with the lowest ping
      const serverWithLessPing = await getRegionWithLessPing()
      changeRegion(serverWithLessPing.tag)
    }
  }

  //#region listeners
  const onConnect = () => {
    if (socket!.recovered) console.log("Socket reconnected")
    else console.log("Socket connected")
  }

  const onConnectionLost = (reason: string) => {
    console.log("Socket disconnected", reason)
    toast({
      description: t("connection-lost"),
      variant: "destructive",
      duration: 5000,
    })
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
      region,
      changeRegion,
      createSocket,
    }),
    [socket, region, changeRegion],
  )

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)
export default SocketContextProvider
