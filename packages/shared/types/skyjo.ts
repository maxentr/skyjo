import { GameToJson } from "./game.js"
import { SkyjoCardToJson } from "./skyjoCard.js"
import { SkyjoPlayerToJson } from "./skyjoPlayer.js"

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
