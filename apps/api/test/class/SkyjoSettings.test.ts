import { SkyjoSettings } from "@/class/SkyjoSettings"
import { SKYJO_DEFAULT_SETTINGS } from "shared/constants"
import { beforeEach, describe, expect, test } from "vitest"

let settings: SkyjoSettings

describe("SkyjoSettings", () => {
  beforeEach(() => {
    settings = new SkyjoSettings()
  })

  test("should return default settings", () => {
    const defaultSettings = new SkyjoSettings()

    expect(defaultSettings.private).toBeFalsy()
    expect(defaultSettings.allowSkyjoForColumn).toBe(
      SKYJO_DEFAULT_SETTINGS.allowSkyjoForColumn,
    )
    expect(defaultSettings.allowSkyjoForRow).toBe(
      SKYJO_DEFAULT_SETTINGS.allowSkyjoForRow,
    )
    expect(defaultSettings.initialTurnedCount).toBe(
      SKYJO_DEFAULT_SETTINGS.cards.INITIAL_TURNED_COUNT,
    )
    expect(defaultSettings.cardPerRow).toBe(
      SKYJO_DEFAULT_SETTINGS.cards.PER_ROW,
    )
    expect(defaultSettings.cardPerColumn).toBe(
      SKYJO_DEFAULT_SETTINGS.cards.PER_COLUMN,
    )
    expect(defaultSettings.maxPlayers).toBe(SKYJO_DEFAULT_SETTINGS.maxPlayers)
  })

  test("should game settings private and with 2 players max", () => {
    const privateSettings = new SkyjoSettings(true, 2)

    expect(privateSettings.private).toBeTruthy()
    expect(privateSettings.maxPlayers).toBe(2)
  })

  test("should change settings", () => {
    const newSettings = {
      private: true,
      allowSkyjoForColumn: true,
      allowSkyjoForRow: true,
      initialTurnedCount: 2,
      cardPerRow: 6,
      cardPerColumn: 8,
    }

    settings.changeSettings(newSettings)

    expect(settings.allowSkyjoForColumn).toBeTruthy()
    expect(settings.allowSkyjoForRow).toBeTruthy()
    expect(settings.initialTurnedCount).toBe(2)
    expect(settings.cardPerRow).toBe(6)
    expect(settings.cardPerColumn).toBe(8)
  })

  test("should return json", () => {
    const settingsToJson = settings.toJson()

    expect(settingsToJson).toStrictEqual({
      private: false,
      allowSkyjoForColumn: true,
      allowSkyjoForRow: false,
      initialTurnedCount: 2,
      cardPerRow: 3,
      cardPerColumn: 4,
      maxPlayers: 8,
    })
  })
})