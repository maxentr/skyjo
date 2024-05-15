import { ChatMessage } from "../types/chat"
import { SkyjoPlayerToJson } from "../types/skyjoPlayer"
import { SendChatMessage } from "../validations/chatMessage"
import { JoinGame } from "../validations/joinGame"
import {
  PlayPickCard,
  PlayReplaceCard,
  PlayRevealCard,
  PlayTurnCard,
} from "../validations/play"
import { CreatePlayer } from "../validations/player"
import { SkyjoToJson } from "./skyjo"

export type ClientToServerEvents = {
  "create-private": (player: CreatePlayer) => void
  find: (player: CreatePlayer) => void
  join: (data: JoinGame) => void
  get: () => void
  start: () => void
  message: (message: SendChatMessage) => void
  "play:reveal-card": (data: PlayRevealCard) => void
  "play:pick-card": (data: PlayPickCard) => void
  "play:replace-card": (data: PlayReplaceCard) => void
  "play:discard-selected-card": () => void
  "play:turn-card": (data: PlayTurnCard) => void
  replay: () => void
  disconnect: () => void
}

export type ServerToClientEvents = {
  "error:join": (message: string) => void
  join: (game: SkyjoToJson) => void
  game: (game: SkyjoToJson) => void
  message: (message: ChatMessage) => void
  winner: (game: SkyjoToJson, winner: SkyjoPlayerToJson) => void
  draw: (game: SkyjoToJson) => void
}

export type SocketData = {
  gameId: string
}
