import { GameToJson } from "./game"
import { SkyjoCardToJson } from "./skyjoCard"
import { SkyjoPlayerToJson } from "./skyjoPlayer"

export type RoundState =
  | "waitingPlayersToTurnTwoCards"
  | "start"
  | "lastLap"
  | "over"

export type TurnState =
  | "chooseAPile"
  | "throwOrReplace"
  | "turnACard"
  | "replaceACard"

export interface SkyjoToJson extends GameToJson<SkyjoPlayerToJson> {
  selectedCard?: SkyjoCardToJson
  roundState: RoundState
  turnState: TurnState
  lastDiscardCardValue?: number
}
