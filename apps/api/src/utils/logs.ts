import { createLogger, format, transports } from "winston"
import DailyRotateFile from "winston-daily-rotate-file"

const logger = createLogger({
  format: format.combine(
    format.json(),
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.printf(({ level, message, timestamp, stack }) => {
      const stackTrace = stack ? `\n${stack}` : ""
      return `${timestamp} [${level}]: ${message} ${stackTrace}`
    }),
  ),
  transports: [new transports.Console()],
})

if (process.env.NODE_ENV === "production") {
  const transport = new DailyRotateFile({
    filename: "skyjo-api-%DATE%.log",
    datePattern: "YYYY-MM-DD-HH",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "14d",
  })

  logger.transports.push(transport)
}

export { logger }
