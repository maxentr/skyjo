import { serve } from "@hono/node-server"
import { Hono } from "hono"
import { Server as HttpServer } from "http"
import { Server } from "socket.io"
import skyjoRouter from "./router.js"

const app = new Hono()
const port = 3001
const server = serve({
  fetch: app.fetch,
  port,
})
const io = new Server(server as HttpServer)

skyjoRouter(io.of("/skyjo"))

app.get("/", (c) => {
  return c.text("API is running!")
})

console.log(`Server is running on port ${port}`)
