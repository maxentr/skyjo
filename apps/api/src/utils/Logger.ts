import { CError } from "@/utils/CError"
import { SeqTransport } from "@datalust/winston-seq"
import { config } from "dotenv"
import { createLogger, format, transports } from "winston"

config()

export class Logger {
  private static readonly winstonLogger = createLogger({
    level: "debug",
    format: format.combine(
      format.json(),
      format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      format.errors({ stack: true }),
      format.prettyPrint(),
    ),
    defaultMeta: {
      app: "skyjo-api",
      environment: process.env.NODE_ENV,
    },
    transports: [
      new transports.Console({
        format: format.combine(
          format.json(),
          format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
          format.errors({ stack: true }),
          format.printf(({ level, message, timestamp, stack }) => {
            const stackTrace = stack ? `\n${stack}` : ""
            return `${timestamp} [${level}]: ${message} ${stackTrace}`
          }),
        ),
      }),
      new SeqTransport({
        serverUrl: process.env.SEQ_URL,
        apiKey: process.env.SEQ_API_KEY,
        onError: (e) => console.error(e),
        handleExceptions: true,
        handleRejections: true,
      }),
    ],
  })

  static debug(message: string, meta?: Record<string, unknown>) {
    Logger.winstonLogger.debug(message, {
      ...meta,
    })
  }

  static info(message: string, meta?: Record<string, unknown>) {
    Logger.winstonLogger.info(message, {
      ...meta,
    })
  }

  static warn(message: string, meta?: Record<string, unknown>) {
    Logger.winstonLogger.warn(message, {
      ...meta,
    })
  }

  static error(message: string, meta?: Record<string, unknown>) {
    Logger.winstonLogger.error(message, {
      ...meta,
    })
  }

  static cError(error: CError, meta?: Record<string, unknown>) {
    const { ...errorRest } = error

    const level = error.level
    delete error.level
    delete error.shouldLog

    const logMeta = {
      ...errorRest,
      ...meta,
    }

    switch (level) {
      case "debug":
        Logger.debug(error.message, logMeta)
        break
      case "info":
        Logger.info(error.message, logMeta)
        break
      case "warn":
        Logger.warn(error.message, logMeta)
        break
      case "error":
      default:
        Logger.error(error.message, logMeta)
        break
    }
  }
}
