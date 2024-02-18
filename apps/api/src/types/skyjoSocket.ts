import { EmitEvents, ListenEvents } from "shared/types/socket.js"
import { Socket } from "socket.io"

export type SkyjoSocket = Socket<EmitEvents, ListenEvents>
