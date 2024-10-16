import type {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketData,
} from "shared/types/socket"
import type { Socket } from "socket.io"

export type SkyjoSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, unknown>,
  SocketData
>
