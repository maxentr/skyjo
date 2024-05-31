import { Server as HttpServer } from "http"
import { serve } from "@hono/node-server"
import { zValidator } from "@hono/zod-validator"
import { config } from "dotenv"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { createTransport } from "nodemailer"
import { ClientToServerEvents, ServerToClientEvents } from "shared/types/socket"
import { feedbackSchema } from "shared/validations/feedback"
import { Server } from "socket.io"
import skyjoRouter from "./socketRouter"

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
    origin: process.env.ORIGINS as string,
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
    connectionStateRecovery: {},
  },
)

skyjoRouter(io)

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
