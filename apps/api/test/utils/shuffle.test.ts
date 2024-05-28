import { shuffle } from "@/utils/shuffle"
import { describe, expect, it } from "vitest"

describe("Shuffle", () => {
  it("should shuffle an array", () => {
    const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

    const shuffled = shuffle(array)

    expect(shuffled).not.toBe(array)
  })
})
