// vitest.config.ts
import tsconfigPaths from "vite-tsconfig-paths"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    coverage: {
      reporter: ["json-summary", "json"],
      reportOnFailure: true,
      provider: "istanbul",
      reportsDirectory: "test/coverage",
      exclude: ["src/constants.ts", "src/controller.ts"],
    },
  },
})
