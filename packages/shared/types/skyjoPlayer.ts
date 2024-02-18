import { PlayerToJson } from "./player.js"
import { SkyjoCardToJson } from "./skyjoCard.js"

export interface SkyjoPlayerToJson extends PlayerToJson {
  readonly scores: number[]
  readonly currentScore: number
  readonly cards: SkyjoCardToJson[][]
}
