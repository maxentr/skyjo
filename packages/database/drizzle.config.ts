import { config } from "dotenv"
import { defineConfig } from "drizzle-kit"
import { checkDatabaseEnv } from "./env.schema"

checkDatabaseEnv()
config({ path: ".env" })

export default defineConfig({
  schema: "./src/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    // drizzle-kit doesn't support boolean env variables
    ssl: (process.env.POSTGRES_SSL as unknown as string) === "true",
  },
})
