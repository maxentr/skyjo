import { SkyjoSettingsToJson } from "shared/types/skyjoSettings"

import { SKYJO_DEFAULT_SETTINGS } from "shared/constants"
import { ChangeSettings } from "shared/validations/changeSettings"
import { GameSettings, GameSettingsInterface } from "./GameSettings"

export interface SkyjoSettingsInterface extends GameSettingsInterface {
  allowSkyjoForColumn: boolean
  allowSkyjoForRow: boolean
  initialTurnedCount: number
  cardPerRow: number
  cardPerColumn: number

  toJson(): SkyjoSettingsToJson
}

export class SkyjoSettings
  extends GameSettings
  implements SkyjoSettingsInterface
{
  allowSkyjoForColumn: boolean = SKYJO_DEFAULT_SETTINGS.allowSkyjoForColumn
  allowSkyjoForRow: boolean = SKYJO_DEFAULT_SETTINGS.allowSkyjoForRow
  initialTurnedCount: number = SKYJO_DEFAULT_SETTINGS.cards.INITIAL_TURNED_COUNT
  cardPerRow: number = SKYJO_DEFAULT_SETTINGS.cards.PER_ROW
  cardPerColumn: number = SKYJO_DEFAULT_SETTINGS.cards.PER_COLUMN

  constructor(
    isPrivate: boolean = false,
    maxPlayers: number = SKYJO_DEFAULT_SETTINGS.maxPlayers,
  ) {
    super(isPrivate, maxPlayers)
  }

  changeSettings(settings: ChangeSettings) {
    this.allowSkyjoForColumn = settings.allowSkyjoForColumn
    this.allowSkyjoForRow = settings.allowSkyjoForRow
    this.initialTurnedCount = settings.initialTurnedCount
    this.cardPerRow = settings.cardPerRow
    this.cardPerColumn = settings.cardPerColumn
  }

  toJson() {
    return {
      ...super.toJson(),
      allowSkyjoForColumn: this.allowSkyjoForColumn,
      allowSkyjoForRow: this.allowSkyjoForRow,
      initialTurnedCount: this.initialTurnedCount,
      cardPerRow: this.cardPerRow,
      cardPerColumn: this.cardPerColumn,
    }
  }
}
