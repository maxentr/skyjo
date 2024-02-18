import { SkyjoToJson } from "../types/skyjo"
import { JoinGame } from "../validations/joinGame"
import {
  PlayDiscardSelectedCard,
  PlayPickCard,
  PlayReplaceCard,
  PlayRevealCard,
  PlayTurnCard,
} from "../validations/play"
import { CreatePlayer } from "../validations/player"
import { StartGame } from "../validations/start"

export type EmitEvents = {
  createPrivate: (player: CreatePlayer) => void
  find: (player: CreatePlayer) => void
  join: (data: JoinGame) => void
  get: (gameId: string) => void
  start: (data: StartGame) => void
  "play:reveal-card": (data: PlayRevealCard) => void
  "play:pick-card": (data: PlayPickCard) => void
  "play:replace-card": (data: PlayReplaceCard) => void
  "play:discard-selected-card": (data: PlayDiscardSelectedCard) => void
  "play:turn-card": (data: PlayTurnCard) => void
  replay: (gameId: string) => void
  disconnect: () => void
}

export type ListenEvents = {
  errorJoin: (error: unknown) => void
  joinGame: (game: SkyjoToJson) => void
  game: (game: SkyjoToJson) => void
  winner: (game: SkyjoToJson, winner: SkyjoToJson) => void
  draw: (game: SkyjoToJson) => void
  playerLeave: (game: SkyjoToJson) => void
}
