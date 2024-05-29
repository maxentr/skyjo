import { GameStatus, GameToJson } from "shared/types/game"
import { MIN_PLAYERS } from "../constants"
import { GameSettings } from "./GameSettings"
import { Player } from "./Player"

export interface GameInterface<TPlayer extends Player> {
  readonly id: string
  status: GameStatus
  players: TPlayer[]
  turn: number
  admin: TPlayer

  getConnectedPlayers(): TPlayer[]
  getCurrentPlayer(): TPlayer
  getPlayer(playerSocketId: string): TPlayer | undefined
  addPlayer(player: TPlayer): void
  removePlayer(playerSocketId: string): void
  isFull(): boolean
  start(): void
  checkTurn(playerSocketId: string): boolean
  nextTurn(): void
  reset(): void

  toJson(): GameToJson
}

export abstract class Game<
  TPlayer extends Player,
  TSettings extends GameSettings,
> implements GameInterface<TPlayer>
{
  // generate a random game id with 8 characters (a-z, A-Z, 0-9)
  readonly _id: string = Math.random().toString(36).substring(2, 10)
  status: GameStatus = "lobby"
  players: TPlayer[] = []
  turn: number = 0
  admin: TPlayer
  settings: TSettings

  constructor(adminPlayer: TPlayer, settings: TSettings) {
    this.admin = adminPlayer
    this.settings = settings
  }

  public get id(): string {
    return this._id
  }

  getConnectedPlayers() {
    return this.players.filter(
      (player) => player.connectionStatus !== "disconnected",
    )
  }

  getCurrentPlayer() {
    return this.players[this.turn]
  }

  getPlayer(playerSocketId: string) {
    return this.players.find((player) => {
      return player.socketId === playerSocketId
    })
  }

  addPlayer(player: TPlayer) {
    if (this.isFull()) throw new Error("game-is-full")
    this.players.push(player)
  }

  changeAdmin() {
    if (this.players.length === 0) throw new Error("no-players")

    this.admin = this.getConnectedPlayers()[0] ?? null
  }

  removePlayer(playerSocketId: string) {
    this.players = this.players.filter((player) => {
      return player.socketId !== playerSocketId
    })
  }

  isAdmin(playerSocketId: string) {
    return this.admin.socketId === playerSocketId
  }

  isFull() {
    return this.getConnectedPlayers().length === this.settings.maxPlayers
  }

  start() {
    if (this.getConnectedPlayers().length < MIN_PLAYERS) throw new Error("too-few-players")

    this.status = "playing"
    this.turn = Math.floor(Math.random() * this.players.length)

    console.log(`Game ${this.id} started`)
  }

  checkTurn(playerSocketId: string) {
    return this.players[this.turn].socketId === playerSocketId
  }

  getNextTurn() {
    let nextTurn = (this.turn + 1) % this.players.length

    while (this.players[nextTurn].connectionStatus !== "connected") {
      nextTurn = (nextTurn + 1) % this.players.length
    }

    return nextTurn
  }
  nextTurn() {
    this.turn = this.getNextTurn()
  }

  reset() {
    this.status = "lobby"
    this.turn = 0
  }

  haveAtLeastMinPlayersConnected() {
    return this.getConnectedPlayers().length >= MIN_PLAYERS
  }

  toJson() {
    return {
      id: this.id,
      status: this.status,
      admin: this.admin.toJson(),
      players: this.players.map((player) => player.toJson()),
      turn: this.turn,
      settings: this.settings.toJson(),
    }
  }
}
