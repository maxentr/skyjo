import {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketData,
} from "shared/types/socket"
import { Socket } from "socket.io"

export type SkyjoSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, unknown>,
  SocketData
>
