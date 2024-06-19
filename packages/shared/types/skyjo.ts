import { SkyjoSettingsToJson } from "types/skyjoSettings"
import { GameToJson } from "./game"
import { SkyjoPlayerToJson } from "./skyjoPlayer"

export type RoundState =
  | "waitingPlayersToTurnInitialCards"
  | "playing"
  | "lastLap"
  | "over"

export type TurnState =
  | "chooseAPile"
  | "throwOrReplace"
  | "turnACard"
  | "replaceACard"

export type Move =
  | "pickFromDrawPile"
  | "pickFromDiscardPile"
  | "throw"
  | "replace"
  | "turn"

export interface SkyjoToJson
  extends GameToJson<SkyjoPlayerToJson, SkyjoSettingsToJson> {
  selectedCardValue: number | null
  roundState: RoundState
  turnState: TurnState
  lastDiscardCardValue?: number
  lastMove: Move
  settings: SkyjoSettingsToJson
}
