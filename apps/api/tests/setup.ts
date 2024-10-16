import { vi } from "vitest"
import "./cerror-matcher"
import type { Env } from "@env"

vi.mock("database/provider", () => ({
  db: {
    query: vi.fn(),
  },
}))

vi.spyOn(process, "env", "get").mockReturnValue({
  NODE_ENV: "test",
  ORIGINS: "e",
  GMAIL_EMAIL: "e",
  GMAIL_APP_PASSWORD: "e",
  SEQ_URL: "e",
  SEQ_API_KEY: "e",
  DATABASE_URL: "e",
  REGION: "LOCAL",
} as const satisfies Env)
