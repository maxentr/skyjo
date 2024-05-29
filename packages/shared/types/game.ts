import { GameSettingsToJson } from "types/gameSettings"
import { PlayerToJson } from "./player"

export type GameStatus = "lobby" | "playing" | "finished" | "stopped"

export type GameToJson<
  TPlayer = PlayerToJson,
  TSettings = GameSettingsToJson,
> = {
  id: string
  status: GameStatus
  admin: TPlayer
  players: TPlayer[]
  turn: number
  settings: TSettings
}
