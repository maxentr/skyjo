import type { Skyjo } from "@/class/Skyjo.js"
import type { SkyjoSocket } from "@/types/skyjoSocket.js"
import type { Error as ErrorType } from "shared/constants"
import type { SocketData } from "shared/types/socket"

type CErrorLevel = "debug" | "info" | "warn" | "error" | "critical"

export interface CErrorOptions {
  code?: ErrorType
  level?: CErrorLevel
  shouldLog?: boolean

  meta?: {
    game?: Skyjo | null
    socket?: SkyjoSocket | null
    [key: string]: unknown
  }
}

interface CErrorMeta {
  game?: Skyjo | null
  socket?: {
    id: string
    data: SocketData
    recovered: boolean
    namespace: string
  } | null
  [key: string]: unknown
}

export class CError extends Error {
  code?: ErrorType
  level?: CErrorLevel = "error"
  stackTrace?: string
  shouldLog?: boolean = true
  meta?: CErrorMeta

  /**
   * @param message - A string describing the error. It cannot be an error code from the Error enum.
   * @param options.code - The error code from the Error enum. This is primarily used to identify the error on the client side.
   * @param options.level - "error" by default.
   * @param options.meta - Additional metadata to be logged with the error.
   */
  constructor(message: string, options: CErrorOptions) {
    super(message)

    const { meta, ...rest } = options
    if (rest.code) this.code = rest.code
    if (rest.level) this.level = rest.level
    if (rest.shouldLog) this.shouldLog = rest.shouldLog

    if (meta) {
      const { socket, ...rest } = meta
      this.meta = rest

      if (socket) {
        this.meta.socket = {
          id: socket.id,
          data: socket.data,
          recovered: socket.recovered,
          namespace: socket?.nsp?.name ?? "unknown",
        }
      }

      // Capture stack trace
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor)
      }
      this.stackTrace = this.stack
    }
  }
}
