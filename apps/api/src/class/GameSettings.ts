import { GameSettingsToJson } from "shared/types/gameSettings"

export interface GameSettingsInterface {
  private: boolean
  maxPlayers: number

  toJson(): GameSettingsToJson
}

export abstract class GameSettings implements GameSettingsInterface {
  private: boolean
  maxPlayers: number

  constructor(isPrivate: boolean, maxPlayers: number) {
    this.private = isPrivate
    this.maxPlayers = maxPlayers
  }

  toJson() {
    return {
      private: this.private,
      maxPlayers: this.maxPlayers,
    }
  }
}
