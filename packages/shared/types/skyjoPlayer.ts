import { PlayerToJson } from "./player"
import { SkyjoCardToJson } from "./skyjoCard"

export type SkyjoPlayerScores = (number | "-")[]
export interface SkyjoPlayerToJson extends PlayerToJson {
  readonly scores: SkyjoPlayerScores
  readonly currentScore: number
  readonly cards: SkyjoCardToJson[][]
}
