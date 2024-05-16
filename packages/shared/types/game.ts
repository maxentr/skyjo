import { GameSettingsToJson } from "types/gameSettings"
import { PlayerToJson } from "./player"

export type GAME_STATUS = "lobby" | "playing" | "finished" | "stopped"

export type GameToJson<
  TPlayer = PlayerToJson,
  TSettings = GameSettingsToJson,
> = {
  id: string
  status: GAME_STATUS
  admin: TPlayer
  players: TPlayer[]
  turn: number
  settings: TSettings
}
