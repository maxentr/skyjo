import { config } from "dotenv"
import { drizzle } from "drizzle-orm/node-postgres"
import { Client } from "pg"
import { checkDatabaseEnv } from "../env.schema"
import * as schema from "./schema"

checkDatabaseEnv()
config()

const client = new Client({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  ssl: process.env.POSTGRES_SSL,
})

export const db = drizzle(client, { schema })
