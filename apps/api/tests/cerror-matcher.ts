import { CError } from "@/utils/CError"
import { Error as ErrorType } from "shared/constants"
import { expect } from "vitest"

expect.extend({
  async toThrowCErrorWithCode(
    // received can be a promise or a function
    received: Promise<void> | (() => void),
    expectedCode: ErrorType,
  ) {
    try {
      if (typeof received === "function") {
        received()
      } else {
        await received
      }

      return {
        message: () =>
          `Expected function to throw CError with code ${expectedCode}, but it didn't throw`,
        pass: false,
      }
    } catch (error) {
      if (error instanceof CError) {
        return {
          message: () =>
            `Expected function not to throw CError with code ${expectedCode}`,
          pass: error.code === expectedCode,
        }
      } else {
        return {
          message: () =>
            `Expected function to throw CError with code ${expectedCode}, but it didn't throw CError`,
          pass: false,
        }
      }
    }
  },
})

interface CustomMatchers<R = unknown> {
  toThrowCErrorWithCode: (code: ErrorType) => R
}

declare module "vitest" {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
