import { Avatar, ConnectionStatus } from "../constants"
import { SkyjoCardToJson } from "./skyjoCard"

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
