import { GAME_STATUS, GameToJSON } from "shared/types/Game"
import { Player } from "./Player"

export interface IGame<TPlayer extends Player> {
  readonly id: string
  readonly private: boolean
  status: GAME_STATUS
  maxPlayers: number
  players: TPlayer[]
  turn: number

  getCurrentPlayer(): TPlayer
  getPlayer(playerSocketID: string): TPlayer | undefined
  addPlayer(player: TPlayer): void
  removePlayer(playerSocketID: string): void
  isFull(): boolean
  start(): void
  checkTurn(playerSocketID: string): boolean
  nextTurn(): void
  reset(): void

  toJSON(): GameToJSON
}

export abstract class Game<TPlayer extends Player> implements IGame<TPlayer> {
  // generate a random game id with 8 characters (a-z, A-Z, 0-9)
  readonly _id: string = Math.random().toString(36).substring(2, 10)
  private: boolean
  status: GAME_STATUS = "lobby"
  maxPlayers!: number
  players: TPlayer[] = []
  turn: number = 0
  admin: TPlayer

  constructor(player: TPlayer, maxPlayers: number, privateGame: boolean) {
    this.admin = player
    this.maxPlayers = maxPlayers
    this.private = privateGame
  }

  public get id(): string {
    return this._id
  }

  getCurrentPlayer() {
    return this.players[this.turn]
  }

  getPlayer(playerSocketID: string) {
    return this.players.find((player) => {
      return player.socketID === playerSocketID
    })
  }

  addPlayer(player: TPlayer) {
    if (this.isFull()) return
    this.players.push(player)
  }

  removePlayer(playerSocketID: string) {
    this.players = this.players.filter((player) => {
      return player.socketID !== playerSocketID
    })
  }

  isFull() {
    return this.players.length === this.maxPlayers
  }

  start() {
    // The game can't start if there are less than 2 players
    if (this.players.length < 2) return

    this.status = "playing"
    this.turn = Math.floor(Math.random() * this.players.length)

    console.log(`Game ${this.id} started`)
  }

  checkTurn(playerSocketID: string) {
    return this.players[this.turn].socketID === playerSocketID
  }

  nextTurn() {
    this.turn = (this.turn + 1) % this.players.length
  }

  reset() {
    this.status = "lobby"
    this.turn = 0
  }

  toJSON() {
    return {
      id: this.id,
      private: this.private,
      status: this.status,
      admin: this.admin.toJSON(),
      maxPlayers: this.maxPlayers,
      players: this.players.map((player) => player.toJSON()),
      turn: this.turn,
    }
  }
}
