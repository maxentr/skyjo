import { ChangeSettings } from "validations/changeSettings"
import { Error } from "../constants"
import {
  ServerChatMessage,
  SystemChatMessage,
  UserChatMessage,
} from "../types/chat"
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
import { LastGame } from "../validations/reconnect"
import { KickVote } from "./kickVote"
import { SkyjoToJson } from "./skyjo"

export type ClientToServerEvents = {
  "create-private": (player: CreatePlayer) => void
  find: (player: CreatePlayer) => void
  join: (data: JoinGame) => void
  reconnect: (data: LastGame) => void
  get: () => void
  start: () => void
  settings: (data: ChangeSettings) => void
  message: (message: SendChatMessage) => void
  "play:reveal-card": (data: PlayRevealCard) => void
  "play:pick-card": (data: PlayPickCard) => void
  "play:replace-card": (data: PlayReplaceCard) => void
  "play:discard-selected-card": () => void
  "play:turn-card": (data: PlayTurnCard) => void
  replay: () => void
  leave: () => void
  disconnect: () => void
  "kick:initiate-vote": (data: { playerToKickId: string }) => void
  "kick:vote": (data: { playerToKickId: string; vote: boolean }) => void
}

export type ErrorJoinMessage = Extract<
  Error,
  "game-not-found" | "game-already-started" | "game-is-full"
>
export type ErrorReconnectMessage = Extract<Error, "cannot-reconnect">

export type ServerToClientEvents = {
  "error:join": (message: ErrorJoinMessage) => void
  "error:reconnect": (message: ErrorReconnectMessage) => void
  join: (game: SkyjoToJson, playerId: string) => void
  game: (game: SkyjoToJson) => void
  message: (message: UserChatMessage) => void
  "message:system": (message: SystemChatMessage) => void
  "message:server": (message: ServerChatMessage) => void
  winner: (game: SkyjoToJson, winner: SkyjoPlayerToJson) => void
  "leave:success": () => void
  "kick:vote": (data: KickVote) => void
  "kick:vote-success": (data: KickVote) => void
  "kick:vote-failed": (data: KickVote) => void
}

export type SocketData = {
  gameCode: string
  playerId: string
}
