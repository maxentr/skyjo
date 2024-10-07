// vitest.config.ts
import tsconfigPaths from "vite-tsconfig-paths"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    coverage: {
      reporter: ["text", "html", "json-summary", "json"],
      reportOnFailure: true,
      provider: "istanbul",
      reportsDirectory: "test-coverage",
      exclude: [
        "env.schema.ts",
        "src/constants.ts",
        "src/index.ts",
        "src/socketRouter.ts",
        "src/**/__tests__/constants-test.ts",
        "src/service/*.ts",
        "src/utils/logs.ts",
      ],
      thresholds: {
        lines: 90,
        branches: 90,
        functions: 90,
        statements: 90,
      },
    },
  },
})
