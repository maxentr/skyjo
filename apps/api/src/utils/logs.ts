import { SeqTransport } from "@datalust/winston-seq"
import { config } from "dotenv"
import { createLogger, format, transports } from "winston"

config()

export class Logger {
  private static readonly winstonLogger = createLogger({
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
}
