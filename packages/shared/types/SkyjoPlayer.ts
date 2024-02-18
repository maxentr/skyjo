import { PlayerToJson } from "./player"
import { SkyjoCardToJson } from "./skyjoCard"

export interface SkyjoPlayerToJson extends PlayerToJson {
  readonly scores: number[]
  readonly currentScore: number
  readonly cards: SkyjoCardToJson[][]
}
