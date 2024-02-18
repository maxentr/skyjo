import {
  PlayDiscardSelectedCard,
  PlayPickCard,
  PlayReplaceCard,
  PlayRevealCard,
  PlayTurnCard,
} from "shared/validations/play.js"
import { CreatePlayer } from "shared/validations/player.js"
import { Socket } from "socket.io"
import { Skyjo } from "./class/Skyjo.js"
import { SkyjoGameController } from "./class/SkyjoGameController.js"
import { SkyjoPlayer } from "./class/SkyjoPlayer.js"
import { CardConstants } from "./constants.js"

export default class SkyjoController extends SkyjoGameController {
  private static instance: SkyjoController

  static getInstance(): SkyjoController {
    if (!SkyjoController.instance) {
      SkyjoController.instance = new SkyjoController()
    }

    return SkyjoController.instance
  }

  async create(socket: Socket, player: CreatePlayer, privateGame = true) {
    const newPlayer = new SkyjoPlayer(player.username, socket.id, player.avatar)

    const game = new Skyjo(newPlayer, privateGame)

    this.onCreate(socket, newPlayer, game)
  }

  async playRevealCard(socket: Socket, turnData: PlayRevealCard) {
    const { gameId, column, row } = turnData

    const game = this.getGame(gameId)
    if (!game) return

    const player = game.getPlayer(socket.id)
    if (!player) return

    if (player.hasRevealedCardCount(CardConstants.INITIAL_TURNED_COUNT)) return

    player.turnCard(column, row)

    game.checkAllPlayersRevealedCards(CardConstants.INITIAL_TURNED_COUNT)

    await this.broadcastGame(socket, gameId)
  }

  async startGame(socket: Socket, gameId: string) {
    const game = this.getGame(gameId)
    if (!game) return

    if (!game.isAdmin(socket.id)) return

    game.start()
    await this.broadcastGame(socket, gameId)
  }

  async pickCard(socket: Socket, { gameId, pile }: PlayPickCard) {
    const { game } = this.checkPlayAuthorization(socket, gameId, [
      "chooseAPile",
    ])

    if (pile === "draw") game.drawCard()
    else game.pickFromDiscard()

    await this.broadcastGame(socket, gameId)
  }

  async replaceCard(socket: Socket, { gameId, column, row }: PlayReplaceCard) {
    const { game, player } = this.checkPlayAuthorization(socket, gameId, [
      "replaceACard",
      "throwOrReplace",
    ])

    game.replaceCard(column, row)

    await this.finishTurn(socket, game, player)
    await this.broadcastGame(socket, gameId)
  }

  async discardCard(socket: Socket, { gameId }: PlayDiscardSelectedCard) {
    const { game } = this.checkPlayAuthorization(socket, gameId, [
      "throwOrReplace",
    ])

    game.discardCard(game.selectedCard!)

    await this.broadcastGame(socket, gameId)
  }

  async turnCard(socket: Socket, { gameId, column, row }: PlayTurnCard) {
    const { game, player } = this.checkPlayAuthorization(socket, gameId, [
      "turnACard",
    ])

    player.turnCard(column, row)

    await this.finishTurn(socket, game, player)
    await this.broadcastGame(socket, gameId)
  }
}
