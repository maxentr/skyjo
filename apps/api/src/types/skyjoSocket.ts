import { ClientToServerEvents, ServerToClientEvents } from "shared/types/socket"
import { Socket } from "socket.io"

export type SkyjoSocket = Socket<ClientToServerEvents, ServerToClientEvents>
