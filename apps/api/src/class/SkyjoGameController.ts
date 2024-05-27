import { SkyjoCard } from "@/class/SkyjoCard"
import { ChatMessage, ChatMessageType } from "shared/types/chat"
import { TurnState } from "shared/types/skyjo"
import { SkyjoSocket } from "../types/skyjoSocket"
import { Skyjo } from "./Skyjo"
import { SkyjoPlayer } from "./SkyjoPlayer"

export abstract class SkyjoGameController {
  private _games: Skyjo[] = []

  getGameWithFreePlace() {
    return this.games.find((game) => {
      return !game.isFull() && game.status === "lobby" && !game.settings.private
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

  async onCreate(socket: SkyjoSocket, player: SkyjoPlayer, game: Skyjo) {
    this.games.push(game)

    await this.onJoin(socket, game.id, player)
  }

  async onGet(socket: SkyjoSocket) {
    const game = this.getGame(socket.data.gameId)
    if (game) socket.emit("game", game.toJson())
  }

  async broadcastGame(socket: SkyjoSocket) {
    const game = this.getGame(socket.data.gameId)
    if (!game) return

    socket.emit("game", game.toJson())

    socket.to(game.id).emit("game", game.toJson())
  }

  async emitToRoom(socket: SkyjoSocket) {
    const game = this.getGame(socket.data.gameId)
    if (!game) return

    socket.to(game.id).emit("game", game.toJson())
  }

  async onJoin(socket: SkyjoSocket, gameId: string, player: SkyjoPlayer) {
    const game = this.getGame(gameId)

    if (!game) throw new Error("game-not-found")
    else if (game.status !== "lobby") throw new Error("game-already-started")

    game.addPlayer(player)
    await socket.join(gameId)

    socket.data = {
      gameId,
    }

    socket.emit("join", game.toJson())
    await this.onMessage(
      socket,
      {
        username: player.name,
        message: "player-joined",
      },
      "player-joined",
    )

    await this.broadcastGame(socket)
  }

  async onDraw(socket: SkyjoSocket, game: Skyjo) {
    game.status = "finished"
    socket.emit("draw", game.toJson())
    socket.to(game.id).emit("draw", game.toJson())
  }

  async onReplay(socket: SkyjoSocket) {
    const game = this.getGame(socket.data.gameId)
    if (!game) return

    game.getPlayer(socket.id)?.toggleReplay()

    // restart game if all connected players want replay
    if (
      game.getConnectedPlayers().every((player) => player.wantReplay) &&
      game.status === "finished"
    ) {
      game.reset()
      game.start()
    }
    await this.broadcastGame(socket)
  }

  async onConnectionLost(socket: SkyjoSocket) {
    const game = this.getGame(socket.data.gameId)
    if (!game) return

    const player = game.getPlayer(socket.id)
    player!.connectionStatus = "connection-lost"

    await this.broadcastGame(socket)
  }

  async onReconnect(socket: SkyjoSocket) {
    const game = this.getGame(socket.data.gameId)
    if (!game) return

    const player = game.getPlayer(socket.id)

    if (!player) return

    player.connectionStatus = "connected"

    await this.broadcastGame(socket)
  }

  async onLeave(socket: SkyjoSocket) {
    const game = this.getGame(socket.data.gameId)
    if (!game) return

    const player = game.getPlayer(socket.id)
    player!.connectionStatus = "disconnected"

    if (!game.haveAtLeastTwoConnected() && game.status !== "lobby") {
      game.status = "stopped"
    }

    if (
      game.status === "lobby" ||
      game.status === "finished" ||
      game.status === "stopped"
    ) {
      game.removePlayer(socket.id)
      if (socket.id === game.admin.socketId) game.changeAdmin()
      if (game.getConnectedPlayers().every((player) => player.wantReplay)) {
        game.reset()
        game.start()
      }
    } else {
      if (game.getCurrentPlayer()?.socketId === socket.id) game.nextTurn()

      if (game.roundState === "waitingPlayersToTurnInitialCards")
        game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)
    }

    socket.to(game.id).emit("message", {
      id: crypto.randomUUID(),
      username: player!.name,
      message: "player-left",
      type: "player-left",
    })

    await this.emitToRoom(socket)

    if (game.getConnectedPlayers().length === 0) this.removeGame(game.id)
    await socket.leave(game.id)
  }

  async onMessage(
    socket: SkyjoSocket,
    { username, message }: Omit<ChatMessage, "id" | "type">,
    type: ChatMessageType = "message",
  ) {
    const game = this.getGame(socket.data.gameId)
    if (!game) return

    const newMessage = {
      id: crypto.randomUUID(),
      username,
      message,
      type,
    } as ChatMessage

    socket.to(game.id).emit("message", newMessage)

    socket.emit("message", newMessage)
  }

  //#region protected
  protected checkPlayAuthorization(
    socket: SkyjoSocket,
    allowedStates: TurnState[],
  ) {
    const game = this.getGame(socket.data.gameId)
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

  protected async finishTurn(
    socket: SkyjoSocket,
    game: Skyjo,
    player: SkyjoPlayer,
  ) {
    let cardsToDiscard: SkyjoCard[] = []

    if (game.settings.allowSkyjoForColumn) {
      cardsToDiscard = player.checkColumnsAndDiscard()
    }
    if (game.settings.allowSkyjoForRow) {
      cardsToDiscard = cardsToDiscard.concat(player.checkRowsAndDiscard())
    }

    if (cardsToDiscard.length > 0) {
      cardsToDiscard.forEach((card) => game.discardCard(card))
    }

    const playerFinished = game.checkIfPlayerFinished(player)

    if (game.firstPlayerToFinish && !playerFinished) {
      // check if the turn comes to the first player who finished
      game.checkEndOfRound()
      // check if the game is finished (player with more than 100 points)
      game.checkEndGame()

      // if the round is over and the game is not finished, start a new round after 10 seconds
      if (game.roundState === "over" && game.status !== "finished") {
        setTimeout(() => {
          game.startNewRound()
          this.broadcastGame(socket)
        }, 10000)
      }
    }

    // next turn
    game.nextTurn()
  }

  //#endregion

  //#region private methods
  private get games() {
    return this._games
  }

  private set games(games: Skyjo[]) {
    this._games = games
  }
  //#endregion
}
