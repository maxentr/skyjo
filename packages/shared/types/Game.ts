import { PlayerToJSON } from "./Player"

export type GAME_STATUS = "lobby" | "playing" | "finished" | "stopped"

export type GameToJSON<TPlayer = PlayerToJSON> = {
  id: string
  private: boolean
  status: GAME_STATUS
  admin: TPlayer
  maxPlayers: number
  players: TPlayer[]
  turn: number
}
