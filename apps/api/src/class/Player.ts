import { Avatar, PlayerToJSON } from "shared/types/Player"

export interface IPlayer {
  readonly name: string
  readonly socketID: string
  readonly avatar: Avatar
  score: number
  wantReplay: boolean

  addPoint(): void
  toggleReplay(): void
  resetReplay(): void
  toJSON(): PlayerToJSON
}
export class Player implements IPlayer {
  readonly name!: string
  readonly _socketID!: string
  readonly avatar!: Avatar
  score: number = 0
  wantReplay: boolean = false

  constructor(ename: string, socketID: string, avatar: Avatar) {
    this.name = ename
    this._socketID = socketID
    this.avatar = avatar
  }

  public get socketID() {
    return this._socketID
  }

  addPoint() {
    this.score += 1
  }

  toggleReplay() {
    this.wantReplay = !this.wantReplay
  }

  resetReplay() {
    this.wantReplay = false
  }

  toJSON() {
    return {
      name: this.name,
      socketID: this.socketID,
      avatar: this.avatar,
      score: this.score,
      wantReplay: this.wantReplay,
    }
  }
}
