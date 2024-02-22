import { Socket } from "socket.io"

import { TurnState } from "shared/types/skyjo"
import { MIN_PLAYERS } from "../constants"
import { Skyjo } from "./Skyjo"
import { SkyjoPlayer } from "./SkyjoPlayer"

export abstract class SkyjoGameController {
  private _games: Skyjo[] = []

  private get games() {
    return this._games
  }
  private set games(games: Skyjo[]) {
    this._games = games
  }

  //#region private

  private findGameByPlayerSocket(socketId: string) {
    return this.games.find((game) => {
      return game.getConnectedPlayers().find((player) => {
        return player.socketId === socketId
      })
    })
  }

  //#endregion

  //#region protected

  protected checkPlayAuthorization(
    socket: Socket,
    gameId: string,
    allowedStates: TurnState[],
  ) {
    const game = this.getGame(gameId)
    if (
      !game ||
      game.status !== "playing" ||
      (game.roundState !== "playing" && game.roundState !== "lastLap")
    )
      throw new Error(`game-not-found`)

    const player = game.getPlayer(socket.id)
    if (!player) throw new Error(`player-not-found`)

    if (!game.checkTurn(socket.id)) throw new Error(`not-your-turn`)

    if (allowedStates.length > 0 && !allowedStates.includes(game.turnState))
      throw new Error(`invalid-turn-state`)

    return { player, game }
  }

  protected async finishTurn(socket: Socket, game: Skyjo, player: SkyjoPlayer) {
    const cardsToDiscard = player.checkColumns()
    if (cardsToDiscard.length > 0) {
      cardsToDiscard.forEach((card) => game.discardCard(card))
    }

    // check if the player has turned all his cards
    const hasPlayerFinished = player.hasRevealedCardCount(
      player.cards.flat().length,
    )

    if (hasPlayerFinished && !game.firstPlayerToFinish) {
      game.firstPlayerToFinish = player
      game.roundState = "lastLap"
    } else if (game.firstPlayerToFinish) {
      // check if the turn comes to the first player who finished
      game.checkEndOfRound()
      // check if the game is finished (player with more than 100 points)
      game.checkEndGame()

      // if the round is over and the game is not finished, start a new round after 10 seconds
      if (game.roundState === "over" && game.status !== "finished") {
        setTimeout(() => {
          game.startNewRound()
          this.broadcastGame(socket, game.id)
        }, 10000)
      }
    }

    // next turn
    game.nextTurn()
  }

  //#endregion

  getGameWithFreePlace() {
    return this.games.find((game) => {
      return !game.isFull() && game.status === "lobby" && !game.private
    })
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

    if (!game) throw new Error("game-not-found")
    else if (game.status !== "lobby") throw new Error("game-already-started")

    game.addPlayer(player)
    await socket.join(gameId)

    socket.emit("joinGame", game.toJson())
    socket.to(gameId).emit("game", game.toJson())
    this.broadcastGame(socket, gameId)
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

    // restart game if all connected players want replay
    if (game.getConnectedPlayers().every((player) => player.wantReplay)) {
      game.reset()
      game.start()

      await this.broadcastGame(socket, game.id)
    } else socket.to(game.id).emit("replay", game.toJson())
  }

  async onConnectionLost(socket: Socket) {
    const game = this.findGameByPlayerSocket(socket.id)
    if (!game) return

    const player = game.getPlayer(socket.id)
    player!.connectionStatus = "connection-lost"

    await this.broadcastGame(socket, game.id)
  }

  async onReconnect(socket: Socket) {
    const game = this.findGameByPlayerSocket(socket.id)
    if (!game) return

    const player = game.getPlayer(socket.id)
    player!.connectionStatus = "connected"

    await this.broadcastGame(socket, game.id)
  }

  async onLeave(socket: Socket) {
    const game = this.findGameByPlayerSocket(socket.id)
    if (!game) return

    const player = game.getPlayer(socket.id)
    player!.connectionStatus = "disconnected"

    if (game.getCurrentPlayer()?.socketId === socket.id) game.nextTurn()

    if (!game.haveAtLeastTwoConnected() && game.status !== "lobby") {
      game.status = "stopped"
      await this.broadcastGame(socket, game.id)
      this.removeGame(game.id)
      this.broadcastGame(socket, game.id)
    } else {
      if (game.status === "lobby") game.removePlayer(socket.id)

      socket.to(game.id).emit("playerLeave", game.toJson(), player?.toJson())
    }
    if (game.roundState === "waitingPlayersToTurnTwoCards") {
      game.checkAllPlayersRevealedCards(MIN_PLAYERS)
      await this.broadcastGame(socket, game.id)
    }

    // await socket.leave(game.id)
  }
}
