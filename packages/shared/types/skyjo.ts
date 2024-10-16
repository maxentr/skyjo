import type {
  GameStatus,
  LastTurnStatus,
  RoundStatus,
  TurnStatus,
} from "../constants.js"
import type { SkyjoPlayerToJson } from "./skyjoPlayer.js"
import type { SkyjoSettingsToJson } from "./skyjoSettings.js"

export interface SkyjoToJson {
  code: string
  status: GameStatus
  adminId: string
  players: SkyjoPlayerToJson[]
  turn: number
  settings: SkyjoSettingsToJson
  selectedCardValue: number | null
  roundStatus: RoundStatus
  turnStatus: TurnStatus
  lastDiscardCardValue?: number
  lastTurnStatus: LastTurnStatus
  updatedAt: Date
}
