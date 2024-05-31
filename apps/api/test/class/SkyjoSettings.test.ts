import { SkyjoSettings } from "@/class/SkyjoSettings"
import { SKYJO_DEFAULT_SETTINGS } from "shared/constants"
import { beforeEach, describe, expect, it } from "vitest"

let settings: SkyjoSettings

describe("SkyjoSettings", () => {
  beforeEach(() => {
    settings = new SkyjoSettings()
  })

  it("should return default settings", () => {
    const defaultSettings = new SkyjoSettings()

    expect(defaultSettings.private).toBeFalsy()
    expect(defaultSettings.allowSkyjoForColumn).toBe(
      SKYJO_DEFAULT_SETTINGS.ALLOW_SKYJO_FOR_COLUMN,
    )
    expect(defaultSettings.allowSkyjoForRow).toBe(
      SKYJO_DEFAULT_SETTINGS.ALLOW_SKYJO_FOR_ROW,
    )
    expect(defaultSettings.initialTurnedCount).toBe(
      SKYJO_DEFAULT_SETTINGS.CARDS.INITIAL_TURNED_COUNT,
    )
    expect(defaultSettings.cardPerRow).toBe(
      SKYJO_DEFAULT_SETTINGS.CARDS.PER_ROW,
    )
    expect(defaultSettings.cardPerColumn).toBe(
      SKYJO_DEFAULT_SETTINGS.CARDS.PER_COLUMN,
    )
    expect(defaultSettings.maxPlayers).toBe(SKYJO_DEFAULT_SETTINGS.MAX_PLAYERS)
  })

  it("should game settings private and with 2 players max", () => {
    const privateSettings = new SkyjoSettings(true, 2)

    expect(privateSettings.private).toBeTruthy()
    expect(privateSettings.maxPlayers).toBe(2)
  })

  it("should change settings", () => {
    const newSettings = {
      private: true,
      allowSkyjoForColumn: true,
      allowSkyjoForRow: true,
      initialTurnedCount: 2,
      cardPerRow: 6,
      cardPerColumn: 8,
      scoreToEndGame: 100,
      multiplierForFirstPlayer: 2,
    }

    settings.changeSettings(newSettings)

    expect(settings.allowSkyjoForColumn).toBeTruthy()
    expect(settings.allowSkyjoForRow).toBeTruthy()
    expect(settings.initialTurnedCount).toBe(2)
    expect(settings.cardPerRow).toBe(6)
    expect(settings.cardPerColumn).toBe(8)
    expect(settings.scoreToEndGame).toBe(100)
    expect(settings.multiplierForFirstPlayer).toBe(2)
  })

  it("should return json", () => {
    const settingsToJson = settings.toJson()

    expect(settingsToJson).toStrictEqual({
      private: false,
      allowSkyjoForColumn: true,
      allowSkyjoForRow: false,
      initialTurnedCount: 2,
      cardPerRow: 3,
      cardPerColumn: 4,
      maxPlayers: 8,
      scoreToEndGame: 100,
      multiplierForFirstPlayer: 2,
    })
  })
})
