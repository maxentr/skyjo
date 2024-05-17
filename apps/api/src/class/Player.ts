import type {
  Avatar,
  ConnectionStatus,
  PlayerToJson,
} from "shared/types/player"

export interface PlayerInterface {
  readonly name: string
  readonly socketId: string
  readonly avatar: Avatar
  connectionStatus: ConnectionStatus
  score: number
  wantReplay: boolean

  addPoint(): void
  toggleReplay(): void
  toJson(): PlayerToJson
}

export abstract class Player implements PlayerInterface {
  readonly name!: string
  readonly socketId: string
  readonly avatar!: Avatar
  connectionStatus: ConnectionStatus = "connected"
  score: number = 0
  wantReplay: boolean = false

  constructor(name: string, socketId: string, avatar: Avatar) {
    this.name = name
    this.socketId = socketId
    this.avatar = avatar
  }

  addPoint(point: number = 1) {
    this.score += point
  }

  toggleReplay() {
    this.wantReplay = !this.wantReplay
  }

  toJson() {
    return {
      name: this.name,
      socketId: this.socketId,
      avatar: this.avatar,
      score: this.score,
      wantReplay: this.wantReplay,
      connectionStatus: this.connectionStatus,
    }
  }
}
