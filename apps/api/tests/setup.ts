import { vi } from "vitest"
import "./cerror-matcher"

vi.mock("database/provider")

vi.stubEnv("POSTGRES_HOST", "test")
vi.stubEnv("POSTGRES_PORT", "test")
vi.stubEnv("POSTGRES_USER", "test")
vi.stubEnv("POSTGRES_PASSWORD", "test")
vi.stubEnv("POSTGRES_DB", "test")
vi.stubEnv("POSTGRES_SSL", "false")
