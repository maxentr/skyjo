import { GAME_STATUS, GameToJson } from "shared/types/game.js"
import { MIN_PLAYERS } from "../constants.js"
import { Player } from "./Player.js"

export interface GameInterface<TPlayer extends Player> {
  readonly id: string
  readonly private: boolean
  status: GAME_STATUS
  maxPlayers: number
  players: TPlayer[]
  turn: number
  admin: TPlayer

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

export abstract class Game<TPlayer extends Player>
  implements GameInterface<TPlayer>
{
  // generate a random game id with 8 characters (a-z, A-Z, 0-9)
  readonly _id: string = Math.random().toString(36).substring(2, 10)
  private: boolean
  status: GAME_STATUS = "lobby"
  maxPlayers!: number
  players: TPlayer[] = []
  turn: number = 0
  admin: TPlayer

  constructor(adminPlayer: TPlayer, maxPlayers: number, isPrivate: boolean) {
    this.admin = adminPlayer
    this.maxPlayers = maxPlayers
    this.private = isPrivate
  }

  public get id(): string {
    return this._id
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

  removePlayer(playerSocketId: string) {
    this.players = this.players.filter((player) => {
      return player.socketId !== playerSocketId
    })
  }

  isAdmin(playerSocketId: string) {
    return this.admin.socketId === playerSocketId
  }

  isFull() {
    return this.players.length === this.maxPlayers
  }

  start() {
    if (this.players.length < MIN_PLAYERS) return

    this.status = "playing"
    this.turn = Math.floor(Math.random() * this.players.length)

    console.log(`Game ${this.id} started`)
  }

  checkTurn(playerSocketId: string) {
    return this.players[this.turn].socketId === playerSocketId
  }

  nextTurn() {
    this.turn = (this.turn + 1) % this.players.length
  }

  reset() {
    this.status = "lobby"
    this.turn = 0
  }

  toJson() {
    return {
      id: this.id,
      private: this.private,
      status: this.status,
      admin: this.admin.toJson(),
      maxPlayers: this.maxPlayers,
      players: this.players.map((player) => player.toJson()),
      turn: this.turn,
    }
  }
}
