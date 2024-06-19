import { ERROR } from "shared/constants"
import { ChatMessage, ChatMessageType } from "shared/types/chat"
import { TurnState } from "shared/types/skyjo"
import { ChangeSettings } from "shared/validations/changeSettings"
import {
  PlayPickCard,
  PlayReplaceCard,
  PlayRevealCard,
  PlayTurnCard,
} from "shared/validations/play"
import { CreatePlayer } from "shared/validations/player"
import { SkyjoSocket } from "../types/skyjoSocket"
import { Skyjo } from "./Skyjo"
import { SkyjoPlayer } from "./SkyjoPlayer"
import { SkyjoSettings } from "./SkyjoSettings"

export default class SkyjoGameController {
  private games: Skyjo[] = []
  private static instance: SkyjoGameController

  static getInstance(): SkyjoGameController {
    if (!SkyjoGameController.instance) {
      SkyjoGameController.instance = new SkyjoGameController()
    }

    return SkyjoGameController.instance
  }

  //#region controllers
  async onCreate(
    socket: SkyjoSocket,
    player: CreatePlayer,
    privateGame = true,
  ) {
    const game = this.createGame(socket, player, privateGame)
    await this.joinGame(socket, game.id, player)
  }

  async onGet(socket: SkyjoSocket) {
    const game = this.getGame(socket.data.gameId)
    if (!game) return

    socket.emit("game", game.toJson())
  }

  async onFind(socket: SkyjoSocket, player: CreatePlayer) {
    let game = this.getPublicGameWithFreePlace()

    if (!game) game = this.createGame(socket, player, false)
    await this.joinGame(socket, game.id, player)
  }

  async onJoin(socket: SkyjoSocket, gameId: string, player: CreatePlayer) {
    await this.joinGame(socket, gameId, player)
  }

  async onSettingsChange(socket: SkyjoSocket, settings: ChangeSettings) {
    const game = this.getGame(socket.data.gameId)
    if (!game) throw new Error(ERROR.GAME_NOT_FOUND)
    if (!game.isAdmin(socket.id)) throw new Error(ERROR.NOT_ALLOWED)

    game.settings.changeSettings(settings)

    await this.broadcastGame(socket, game)
  }

  async onGameStart(socket: SkyjoSocket) {
    const game = this.getGame(socket.data.gameId)
    if (!game) throw new Error(ERROR.GAME_NOT_FOUND)
    if (!game.isAdmin(socket.id)) throw new Error(ERROR.NOT_ALLOWED)

    game.start()
    await this.broadcastGame(socket, game)
  }

  //#region game actions
  async onRevealCard(socket: SkyjoSocket, turnData: PlayRevealCard) {
    const { column, row } = turnData
    const gameId = socket.data.gameId

    const game = this.getGame(gameId)
    if (!game) throw new Error(ERROR.GAME_NOT_FOUND)

    const player = game.getPlayer(socket.id)
    if (!player) throw new Error(ERROR.PLAYER_NOT_FOUND)

    if (
      game.status !== "playing" ||
      game.roundState !== "waitingPlayersToTurnInitialCards"
    )
      throw new Error(ERROR.NOT_ALLOWED)

    if (player.hasRevealedCardCount(game.settings.initialTurnedCount)) return

    player.turnCard(column, row)

    game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)

    await this.broadcastGame(socket, game)
  }

  async onPickCard(socket: SkyjoSocket, { pile }: PlayPickCard) {
    const { game } = this.checkPlayAuthorization(socket, ["chooseAPile"])

    if (pile === "draw") game.drawCard()
    else game.pickFromDiscard()

    await this.broadcastGame(socket, game)
  }

  async onReplaceCard(socket: SkyjoSocket, { column, row }: PlayReplaceCard) {
    const { game } = this.checkPlayAuthorization(socket, [
      "replaceACard",
      "throwOrReplace",
    ])

    game.replaceCard(column, row)

    await this.broadcastGame(socket, game)

    await this.finishTurn(socket, game)
  }

  async onDiscardCard(socket: SkyjoSocket) {
    const { game } = this.checkPlayAuthorization(socket, ["throwOrReplace"])

    game.discardCard(game.selectedCardValue!)

    await this.broadcastGame(socket, game)
  }

  async onTurnCard(socket: SkyjoSocket, { column, row }: PlayTurnCard) {
    const { game, player } = this.checkPlayAuthorization(socket, ["turnACard"])

    game.turnCard(player, column, row)

    await this.broadcastGame(socket, game)

    await this.finishTurn(socket, game)
  }
  //#endregion

  async onReplay(socket: SkyjoSocket) {
    const game = this.getGame(socket.data.gameId)
    if (!game) throw new Error(ERROR.GAME_NOT_FOUND)
    if (game.status !== "finished") throw new Error(ERROR.NOT_ALLOWED)

    game.getPlayer(socket.id)?.toggleReplay()

    game.restartGameIfAllPlayersWantReplay()

    await this.broadcastGame(socket, game)
  }

  async onConnectionLost(socket: SkyjoSocket) {
    const game = this.getGame(socket.data.gameId)
    if (!game) return

    const player = game.getPlayer(socket.id)
    player!.connectionStatus = "connection-lost"

    await this.broadcastGame(socket, game)
  }

  async onReconnect(socket: SkyjoSocket) {
    const game = this.getGame(socket.data.gameId)
    if (!game) throw new Error(ERROR.GAME_NOT_FOUND)

    const player = game.getPlayer(socket.id)
    if (!player) throw new Error(ERROR.PLAYER_NOT_FOUND)

    player.connectionStatus = "connected"

    await this.broadcastGame(socket, game)
  }

  async onLeave(socket: SkyjoSocket) {
    const game = this.getGame(socket.data.gameId)
    if (!game) return

    const player = game.getPlayer(socket.id)
    if (!player) throw new Error(ERROR.PLAYER_NOT_FOUND)

    player.connectionStatus = "disconnected"

    if (!game.haveAtLeastMinPlayersConnected() && game.status !== "lobby") {
      game.status = "stopped"
    }

    if (socket.id === game.admin.socketId) game.changeAdmin()

    if (
      game.status === "lobby" ||
      game.status === "finished" ||
      game.status === "stopped"
    ) {
      game.removePlayer(socket.id)

      game.restartGameIfAllPlayersWantReplay()
    } else {
      if (game.getCurrentPlayer()?.socketId === socket.id) game.nextTurn()

      if (game.roundState === "waitingPlayersToTurnInitialCards")
        game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)
    }

    if (game.getConnectedPlayers().length === 0) this.removeGame(game.id)
    else {
      socket.to(game.id).emit("message", {
        id: crypto.randomUUID(),
        username: player.name,
        message: "player-left",
        type: "player-left",
      })

      await this.emitToRoom(socket, game)
    }

    await socket.leave(game.id)
  }

  async onMessage(
    socket: SkyjoSocket,
    { username, message }: Omit<ChatMessage, "id" | "type">,
    type: ChatMessageType = "message",
  ) {
    const game = this.getGame(socket.data.gameId)
    if (!game) throw new Error(ERROR.GAME_NOT_FOUND)

    if (!game.getPlayer(socket.id)) throw new Error(ERROR.PLAYER_NOT_FOUND)

    const newMessage = {
      id: crypto.randomUUID(),
      username,
      message,
      type,
    } as ChatMessage

    socket.to(game.id).emit("message", newMessage)

    socket.emit("message", newMessage)
  }
  //#endregion

  //#region private methods
  private getGame(gameId: string) {
    return this.games.find((game) => {
      return game.id === gameId
    })
  }

  private removeGame(gameId: string) {
    this.games = this.games.filter((game) => {
      return game.id !== gameId
    })
  }

  private getPublicGameWithFreePlace() {
    return this.games.find((game) => {
      return !game.isFull() && game.status === "lobby" && !game.settings.private
    })
  }

  private createGame(
    socket: SkyjoSocket,
    player: CreatePlayer,
    privateGame: boolean,
  ) {
    const newPlayer = new SkyjoPlayer(player.username, socket.id, player.avatar)
    const settings = new SkyjoSettings(privateGame)

    const game = new Skyjo(newPlayer, settings)
    this.games.push(game)

    return game
  }

  private async joinGame(
    socket: SkyjoSocket,
    gameId: string,
    player: CreatePlayer,
  ) {
    const game = this.getGame(gameId)
    if (!game) throw new Error(ERROR.GAME_NOT_FOUND)
    else if (game.status !== "lobby") throw new Error("game-already-started")

    const newPlayer = new SkyjoPlayer(player.username, socket.id, player.avatar)
    game.addPlayer(newPlayer)
    await socket.join(gameId)

    socket.data = {
      gameId,
    }

    socket.emit("join", game.toJson())
    await this.onMessage(
      socket,
      {
        username: player.username,
        message: "player-joined",
      },
      "player-joined",
    )

    await this.broadcastGame(socket, game)
  }

  private async broadcastGame(socket: SkyjoSocket, game: Skyjo) {
    socket.emit("game", game.toJson())

    socket.to(game.id).emit("game", game.toJson())
  }

  private async emitToRoom(socket: SkyjoSocket, game: Skyjo) {
    socket.to(game.id).emit("game", game.toJson())
  }

  private checkPlayAuthorization(
    socket: SkyjoSocket,
    allowedStates: TurnState[],
  ) {
    const game = this.getGame(socket.data.gameId)
    if (!game) throw new Error(ERROR.GAME_NOT_FOUND)

    if (
      game.status !== "playing" ||
      (game.roundState !== "playing" && game.roundState !== "lastLap")
    )
      throw new Error(ERROR.NOT_ALLOWED)

    const player = game.getPlayer(socket.id)
    if (!player) throw new Error(`player-not-found`)

    if (!game.checkTurn(socket.id)) throw new Error(`not-your-turn`)

    if (allowedStates.length > 0 && !allowedStates.includes(game.turnState))
      throw new Error(`invalid-turn-state`)

    return { player, game }
  }

  private async finishTurn(socket: SkyjoSocket, game: Skyjo) {
    game.nextTurn()

    if (game.roundState === "over" && game.status !== "finished") {
      setTimeout(() => {
        game.startNewRound()
        this.broadcastGame(socket, game)
      }, 10000)
    }
    await this.broadcastGame(socket, game)
  }
  //#endregion
}
