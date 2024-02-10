import { GametoJson } from "./Game"
import { SkyjoCardtoJson } from "./SkyjoCard"
import { SkyjoPlayertoJson } from "./SkyjoPlayer"

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

export interface SkyjotoJson extends GametoJson<SkyjoPlayertoJson> {
  selectedCard?: SkyjoCardtoJson
  roundState: RoundState
  turnState: TurnState
  lastDiscardCardValue?: number
}
