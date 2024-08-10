import {
  GameStatus,
  LastTurnStatus,
  RoundStatus,
  TurnStatus,
} from "../constants"
import { SkyjoPlayerToJson } from "./skyjoPlayer"
import { SkyjoSettingsToJson } from "./skyjoSettings"

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
}
