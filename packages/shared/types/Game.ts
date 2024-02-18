import { PlayerToJson } from "./player.js"

export type GAME_STATUS = "lobby" | "playing" | "finished" | "stopped"

export type GameToJson<TPlayer = PlayerToJson> = {
  id: string
  private: boolean
  status: GAME_STATUS
  admin: TPlayer
  maxPlayers: number
  players: TPlayer[]
  turn: number
}
