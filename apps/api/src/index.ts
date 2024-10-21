import { initializeSocketServer } from "@/initializeSocketServer.js"
import { Logger } from "@/utils/Logger.js"
import { mailer } from "@/utils/mailer.js"
import { ENV } from "@env"
import { serve } from "@hono/node-server"
import { zValidator } from "@hono/zod-validator"
import { config } from "dotenv"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { feedbackSchema } from "shared/validations/feedback"

config()

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
initializeSocketServer(server)

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

  mailer.sendMail(mailOptions, (error) => {
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
