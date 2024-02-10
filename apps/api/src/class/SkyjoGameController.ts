import { Socket } from "socket.io"

import { Skyjo } from "./Skyjo"
import { SkyjoPlayer } from "./SkyjoPlayer"

interface SkyjoGameControllerInterface {
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

export abstract class SkyjoGameController
  implements SkyjoGameControllerInterface
{
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

  private findGameByPlayerSocket(socketId: string) {
    return this.games.find((game) => {
      return game.players.find((player) => {
        return player.socketId === socketId
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

    await this.onJoin(socket, game.id, player)
  }

  async onGet(socket: Socket, gameId: string) {
    const game = this.getGame(gameId)
    if (game) socket.emit("game", game.toJson())
  }

  async broadcastGame(socket: Socket, gameId: string) {
    const game = this.getGame(gameId)
    if (!game) return

    socket.emit("game", game.toJson())

    socket.to(game.id).emit("game", game.toJson())
  }

  async onJoin(socket: Socket, gameId: string, player: SkyjoPlayer) {
    const game = this.getGame(gameId)

    if (!game) throw "game-not-found"
    else if (game.status !== "lobby") throw "game-already-started"

    game.addPlayer(player)
    await socket.join(gameId)

    socket.emit("joinGame", game.toJson())

    socket.to(gameId).emit("game", game.toJson())
  }

  async onWin(socket: Socket, game: Skyjo, winner: SkyjoPlayer) {
    game.status = "finished"
    game.getPlayer(winner.socketId)?.addPoint()

    socket.emit("winner", game.toJson(), winner.toJson())
    socket.to(game.id).emit("winner", game.toJson(), winner.toJson())
  }

  async onDraw(socket: Socket, game: Skyjo) {
    game.status = "finished"
    socket.emit("draw", game.toJson())
    socket.to(game.id).emit("draw", game.toJson())
  }

  async onReplay(socket: Socket, gameId: string) {
    const game = this.getGame(gameId)
    if (!game) return

    game.getPlayer(socket.id)?.toggleReplay()

    // restart game if all players want replay
    if (game.players.every((player) => player.wantReplay)) {
      game.reset()
      game.start()

      await this.broadcastGame(socket, game.id)
    } else socket.to(game.id).emit("replay", game.toJson())
  }

  async onLeave(socket: Socket) {
    const game = this.findGameByPlayerSocket(socket.id)
    if (!game) return

    game.removePlayer(socket.id)
    game.status = "stopped"
    await socket.leave(game.id)

    if (game.players.length === 0) {
      this.removeGame(game.id)
    } else {
      socket.to(game.id).emit("playerLeave", game.toJson())
    }
  }
}
