import { vi } from "vitest"
import "./cerror-matcher"

vi.mock("database/provider")

// mock ENV const from env.ts
vi.mock("env.ts", () => ({
  ENV: {
    NODE_ENV: "test",
    ORIGINS: "",
    GMAIL_EMAIL: "",
    GMAIL_APP_PASSWORD: "",
    SEQ_URL: "",
    SEQ_API_KEY: "",
    DATABASE_URL: "",
    REGION: "LOCAL",
  },
}))
