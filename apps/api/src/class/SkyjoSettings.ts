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
  allowSkyjoForColumn: boolean = SKYJO_DEFAULT_SETTINGS.ALLOW_SKYJO_FOR_COLUMN
  allowSkyjoForRow: boolean = SKYJO_DEFAULT_SETTINGS.ALLOW_SKYJO_FOR_ROW
  initialTurnedCount: number = SKYJO_DEFAULT_SETTINGS.CARDS.INITIAL_TURNED_COUNT
  cardPerRow: number = SKYJO_DEFAULT_SETTINGS.CARDS.PER_ROW
  cardPerColumn: number = SKYJO_DEFAULT_SETTINGS.CARDS.PER_COLUMN
  scoreToEndGame: number = SKYJO_DEFAULT_SETTINGS.SCORE_TO_END_GAME
  multiplierForFirstPlayer: number =
    SKYJO_DEFAULT_SETTINGS.MULTIPLIER_FOR_FIRST_PLAYER

  constructor(
    isPrivate: boolean = false,
    maxPlayers: number = SKYJO_DEFAULT_SETTINGS.MAX_PLAYERS,
  ) {
    super(isPrivate, maxPlayers)
  }

  changeSettings(settings: ChangeSettings) {
    this.private = settings.private
    this.allowSkyjoForColumn = settings.allowSkyjoForColumn
    this.allowSkyjoForRow = settings.allowSkyjoForRow
    this.initialTurnedCount = settings.initialTurnedCount
    this.cardPerRow = settings.cardPerRow
    this.cardPerColumn = settings.cardPerColumn
    this.scoreToEndGame = settings.scoreToEndGame
    this.multiplierForFirstPlayer = settings.multiplierForFirstPlayer
  }

  toJson() {
    return {
      ...super.toJson(),
      allowSkyjoForColumn: this.allowSkyjoForColumn,
      allowSkyjoForRow: this.allowSkyjoForRow,
      initialTurnedCount: this.initialTurnedCount,
      cardPerRow: this.cardPerRow,
      cardPerColumn: this.cardPerColumn,
      scoreToEndGame: this.scoreToEndGame,
      multiplierForFirstPlayer: this.multiplierForFirstPlayer,
    }
  }
}
