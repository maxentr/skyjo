import { Server as HttpServer } from "http"
import { chatRouter } from "@/routers/chat.router.js"
import { gameRouter } from "@/routers/game.router.js"
import { kickRouter } from "@/routers/kick.router.js"
import { lobbyRouter } from "@/routers/lobby.router.js"
import { playerRouter } from "@/routers/player.router.js"
import type { SkyjoSocket } from "@/types/skyjoSocket.js"
import { Logger } from "@/utils/Logger.js"
import { ENV } from "@env"
import { serve } from "@hono/node-server"
import { zValidator } from "@hono/zod-validator"
import { config } from "dotenv"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { createTransport } from "nodemailer"
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "shared/types/socket"
import { feedbackSchema } from "shared/validations/feedback"
import { Server } from "socket.io"
import customParser from "socket.io-msgpack-parser"

config()

const transporter = createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: ENV.GMAIL_EMAIL,
    pass: ENV.GMAIL_APP_PASSWORD,
  },
})

const app = new Hono()

app.use(
  "/*",
  cors({
    origin: ENV.ORIGINS,
  }),
)

const port = 3001
const server = serve({
  fetch: app.fetch,
  port,
})

const io = new Server<ClientToServerEvents, ServerToClientEvents>(
  server as HttpServer,
  {
    parser: customParser,
    cors: {
      origin: ENV.ORIGINS,
    },
    pingInterval: 5000,
    pingTimeout: 60000,
    connectionStateRecovery: {
      maxDisconnectionDuration: 180000,
      skipMiddlewares: true,
    },
  },
)

io.engine.on("connection_error", (err) => {
  Logger.error("Socket connection error", err)
})

io.on("connection", (socket: SkyjoSocket) => {
  lobbyRouter(socket)
  playerRouter(socket)
  gameRouter(socket)
  chatRouter(socket)
  kickRouter(socket)
})

app.get("/", (c) => {
  return c.text("API is running!")
})

app.post("/feedback", zValidator("json", feedbackSchema), (c) => {
  const { email, message } = c.req.valid("json")

  const mailOptions = {
    from: ENV.GMAIL_EMAIL,
    to: ENV.GMAIL_EMAIL,
    subject: `[SKYJO feedback] - from: ${email ?? "anonymous"}`,
    text: message,
  }

  transporter.sendMail(mailOptions, (error) => {
    if (error) {
      Logger.error("Error while sending feedback", {
        error,
      })
      return c.json({ success: false })
    }
  })

  return c.json({ success: true })
})

Logger.info(`Server started on port ${port}`)
