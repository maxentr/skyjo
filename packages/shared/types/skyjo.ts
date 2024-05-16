import { SkyjoSettingsToJson } from "types/skyjoSettings"
import { GameToJson } from "./game"
import { SkyjoCardToJson } from "./skyjoCard"
import { SkyjoPlayerToJson } from "./skyjoPlayer"

export type RoundState =
  | "waitingPlayersToTurnTwoCards"
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
  selectedCard?: SkyjoCardToJson
  roundState: RoundState
  turnState: TurnState
  lastDiscardCardValue?: number
  lastMove: Move
  settings: SkyjoSettingsToJson
}
