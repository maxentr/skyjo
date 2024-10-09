import { z } from "zod"
export const envSchema = z.object({
  POSTGRES_HOST: z.string({
    message: "POSTGRES_HOST must be set in .env file",
  }),
  POSTGRES_PORT: z.coerce.number({
    message: "POSTGRES_PORT must be set in .env file",
  }),
  POSTGRES_USER: z.string({
    message: "POSTGRES_USER must be set in .env file",
  }),
  POSTGRES_PASSWORD: z.string({
    message: "POSTGRES_PASSWORD must be set in .env file",
  }),
  POSTGRES_DB: z.string({ message: "POSTGRES_DB must be set in .env file" }),
  POSTGRES_SSL: z.coerce.boolean({
    message: "POSTGRES_SSL must be set in .env file",
  }),
})

export const checkDatabaseEnv = () => envSchema.parse(process.env)

export type Env = z.infer<typeof envSchema>
