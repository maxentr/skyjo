import tsconfigPaths from "vite-tsconfig-paths"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    reporters: ["vitest-sonar-reporter"],
    outputFile: {
      "vitest-sonar-reporter": "./tests/sonar-report.xml",
    },
    setupFiles: "./tests/setup.ts",
    coverage: {
      reporter: ["text", "html", "json-summary", "json", "lcov"],
      reportOnFailure: true,
      provider: "istanbul",
      reportsDirectory: "tests/coverage",
      exclude: [
        "env.ts",
        "src/constants.ts",
        "src/index.ts",
        "src/**/__tests__/constants-test.ts",
        "src/**/__tests__/_mock.ts",
        "tests/*.ts",
        "src/service/*.ts",
        "src/utils/CError.ts",
        "src/utils/Logger.ts",
        "src/utils/socketErrorHandlerWrapper.ts",
        "src/db/*.ts",
        "src/routers/*.ts",
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
