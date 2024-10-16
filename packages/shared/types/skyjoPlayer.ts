import type { Avatar, ConnectionStatus } from "../constants.js"
import type { SkyjoCardToJson } from "./skyjoCard.js"

export type SkyjoPlayerScores = (number | "-")[]

export interface SkyjoPlayerToJson {
  readonly id: string
  readonly name: string
  readonly socketId: string
  readonly avatar: Avatar
  readonly score: number
  readonly wantsReplay: boolean
  readonly connectionStatus: ConnectionStatus
  readonly scores: SkyjoPlayerScores
  readonly currentScore: number
  readonly cards: SkyjoCardToJson[][]
  readonly isAdmin: boolean
}
