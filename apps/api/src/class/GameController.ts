import { Socket } from "socket.io"

import { Skyjo } from "./Skyjo"
import { SkyjoPlayer } from "./SkyjoPlayer"

export interface IGameController {
  games: Skyjo[]
  addGame(game: Skyjo): void
  removeGame(gameId: string): void
  getGame(gameId: string): Skyjo | undefined
  getGameWithFreePlace(): Skyjo | undefined
  onCreate(socket: Socket, player: SkyjoPlayer, game: Skyjo): Promise<void>
  onGet(socket: Socket, gameId: string): Promise<void>
  onJoin(socket: Socket, gameId: string, player: SkyjoPlayer): Promise<void>
  onWin(socket: Socket, game: Skyjo, winner: SkyjoPlayer): Promise<void>
  onDraw(socket: Socket, game: Skyjo): Promise<void>
  onReplay(socket: Socket, gameId: string): Promise<void>
  onLeave(socket: Socket): Promise<void>
}

export abstract class GameController implements IGameController {
  private _games: Skyjo[] = []

  get games() {
    return this._games
  }
  private set games(games: Skyjo[]) {
    this._games = games
  }

  addGame(game: Skyjo) {
    this.games.push(game)
  }

  removeGame(gameId: string) {
    this.games = this.games.filter((game) => {
      return game.id !== gameId
    })
  }

  getGame(gameId: string) {
    return this.games.find((game) => {
      return game.id === gameId
    })
  }

  private retrieveGameByPlayerSocket(socketId: string) {
    return this.games.find((game) => {
      return game.players.find((player) => {
        return player.socketID === socketId
      })
    })
  }

  getGameWithFreePlace() {
    return this.games.find((game) => {
      return !game.isFull() && game.status === "lobby" && !game.private
    })
  }

  async onCreate(socket: Socket, player: SkyjoPlayer, game: Skyjo) {
    this.games.push(game)

    this.onJoin(socket, game.id, player)
  }

  async onGet(socket: Socket, gameId: string) {
    const game = this.getGame(gameId)
    if (game) socket.emit("game", game.toJSON())
  }

  async sendGame(socket: Socket, gameId: string) {
    const game = this.getGame(gameId)
    if (!game) return

    socket.emit("game", game.toJSON())

    socket.to(game.id).emit("game", game.toJSON())
  }

  async onJoin(socket: Socket, gameId: string, player: SkyjoPlayer) {
    const game = this.getGame(gameId)

    if (!game || game.isFull()) throw "game-not-found"
    else if (game.status !== "lobby") throw "game-already-started"
    else if (game.isFull()) throw "game-is-full"

    game.addPlayer(player)
    await socket.join(gameId)

    socket.emit("joinGame", game.toJSON())

    socket.to(gameId).emit("game", game.toJSON())
  }

  async onWin(socket: Socket, game: Skyjo, winner: SkyjoPlayer) {
    game.status = "finished"
    game.getPlayer(winner.socketID)?.addPoint()

    socket.emit("winner", game.toJSON(), winner.toJSON())
    socket.to(game.id).emit("winner", game.toJSON(), winner.toJSON())
  }

  async onDraw(socket: Socket, game: Skyjo) {
    game.status = "finished"
    socket.emit("draw", game.toJSON())
    socket.to(game.id).emit("draw", game.toJSON())
  }

  async onReplay(socket: Socket, gameId: string) {
    const game = this.getGame(gameId)
    if (!game) return

    game.getPlayer(socket.id)?.toggleReplay()

    // restart game if all players want replay
    if (game.players.every((player) => player.wantReplay)) {
      game.reset()
      game.start()

      socket.emit("game", game)
      socket.to(game.id).emit("game", game.toJSON())
    } else socket.to(game.id).emit("replay", game.toJSON())
  }

  async onLeave(socket: Socket) {
    const game = this.retrieveGameByPlayerSocket(socket.id)
    if (!game) return

    game.removePlayer(socket.id)
    game.status = "stopped"
    await socket.leave(game.id)

    if (game.players.length === 0) {
      this.removeGame(game.id)
    } else {
      socket.to(game.id).emit("playerLeave", game.toJSON())
    }
  }
}
