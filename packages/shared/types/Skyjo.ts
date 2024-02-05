import { GameToJSON } from "./Game"
import { SkyjoCardToJSON } from "./SkyjoCard"
import { SkyjoPlayerToJSON } from "./SkyjoPlayer"

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

export interface SkyjoToJSON extends GameToJSON<SkyjoPlayerToJSON> {
  selectedCard?: SkyjoCardToJSON
  roundState: RoundState
  turnState: TurnState
  lastDiscardCardValue?: number
}
