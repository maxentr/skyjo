import { GameSettingsToJson } from "types/gameSettings"

export interface SkyjoSettingsToJson extends GameSettingsToJson {
  // typescript extends bug
  private: boolean
  maxPlayers: number

  allowSkyjoForColumn: boolean
  allowSkyjoForRow: boolean
  initialTurnedCount: number
  cardPerRow: number
  cardPerColumn: number
}
