import { SeqTransport } from "@datalust/winston-seq"
import { config } from "dotenv"
import { createLogger, format, transports } from "winston"

config()

const logger = createLogger({
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.json(),
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

export { logger }
