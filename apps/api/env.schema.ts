import { checkDatabaseEnv } from "database/env.schema"
import { API_REGIONS_TAGS } from "shared/constants"
import { z } from "zod"
export const envSchema = z.object({
  ORIGINS: z.string({ message: "ORIGINS must be set in .env file" }),

  GMAIL_EMAIL: z.string({ message: "GMAIL_EMAIL must be set in .env file" }),
  GMAIL_APP_PASSWORD: z.string({
    message: "GMAIL_APP_PASSWORD must be set in .env file",
  }),

  SEQ_URL: z.string({ message: "SEQ_URL must be set in .env file" }),
  SEQ_API_KEY: z.string({ message: "SEQ_API_KEY must be set in .env file" }),

  REGION: z.enum(API_REGIONS_TAGS, {
    message: "REGION must be set in .env file",
  }),
})

export const checkEnv = () => {
  checkDatabaseEnv()
  envSchema.parse(process.env)
}

export type Env = z.infer<typeof envSchema>
