import { SkyjoCard } from "@/class/SkyjoCard"
import { beforeEach, describe, expect, it } from "vitest"

let card: SkyjoCard

describe("SkyjoCard", () => {
  beforeEach(() => {
    card = new SkyjoCard(0)
  })

  it("should create a new card", () => {
    expect(card.value).toBe(0)
    expect(card.isVisible).toBeFalsy()
  })

  it("should turn a card to visible", () => {
    expect(card.isVisible).toBeFalsy()

    card.turnVisible()

    expect(card.isVisible).toBeTruthy()
  })

  it("should return the card value", () => {
    const card = new SkyjoCard(0)

    expect(card.value).toBe(0)
  })

  it("should return json with value as undefined if the card is not visible", () => {
    const card = new SkyjoCard(0)

    expect(card.toJson()).toMatchObject({
      value: undefined,
      isVisible: false,
    })
  })

  it("should return json with value if card is visible", () => {
    const card = new SkyjoCard(0, true)

    expect(card.toJson()).toMatchObject({
      value: 0,
      isVisible: true,
    })
  })
})
