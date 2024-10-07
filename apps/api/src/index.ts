import { Server as HttpServer } from "http"
import { chatRouter } from "@/routers/chat.router"
import { gameRouter } from "@/routers/game.router"
import { lobbyRouter } from "@/routers/lobby.router"
import { playerRouter } from "@/routers/player.router"
import { SkyjoSocket } from "@/types/skyjoSocket"
import { logger } from "@/utils/logs"
import { serve } from "@hono/node-server"
import { zValidator } from "@hono/zod-validator"
import { config } from "dotenv"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { createTransport } from "nodemailer"
import { ClientToServerEvents, ServerToClientEvents } from "shared/types/socket"
import { feedbackSchema } from "shared/validations/feedback"
import { Server } from "socket.io"
import customParser from "socket.io-msgpack-parser"
import { checkEnv } from "../env.schema"

checkEnv()
config()

const transporter = createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

const app = new Hono()

app.use(
  "/*",
  cors({
    origin: process.env.ORIGINS,
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
      origin: process.env.ORIGINS,
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
  logger.error(`${err.code} - ${err.message} - ${err.context}`)
})

io.on("connection", (socket: SkyjoSocket) => {
  lobbyRouter(socket)
  playerRouter(socket)
  gameRouter(socket)
  chatRouter(socket)
})

app.get("/", (c) => {
  return c.text("API is running!")
})

app.post("/feedback", zValidator("json", feedbackSchema), (c) => {
  const { email, message } = c.req.valid("json")

  const mailOptions = {
    from: process.env.GMAIL_EMAIL,
    to: process.env.GMAIL_EMAIL,
    subject: `[SKYJO feedback] - from: ${email ?? "anonymous"}`,
    text: message,
  }

  transporter.sendMail(mailOptions, (error) => {
    if (error) {
      return c.json({ success: false })
    }
  })

  return c.json({ success: true })
})

console.log(`Server is running on port ${port}`)
