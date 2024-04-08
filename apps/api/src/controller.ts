import {
  PlayDiscardSelectedCard,
  PlayPickCard,
  PlayReplaceCard,
  PlayRevealCard,
  PlayTurnCard,
} from "shared/validations/play"
import { CreatePlayer } from "shared/validations/player"
import { Skyjo } from "./class/Skyjo"
import { SkyjoGameController } from "./class/SkyjoGameController"
import { SkyjoPlayer } from "./class/SkyjoPlayer"
import { CardConstants } from "./constants"
import { SkyjoSocket } from "./types/skyjoSocket"

export default class SkyjoController extends SkyjoGameController {
  private static instance: SkyjoController

  static getInstance(): SkyjoController {
    if (!SkyjoController.instance) {
      SkyjoController.instance = new SkyjoController()
    }

    return SkyjoController.instance
  }

  async create(socket: SkyjoSocket, player: CreatePlayer, privateGame = true) {
    const newPlayer = new SkyjoPlayer(player.username, socket.id, player.avatar)

    const game = new Skyjo(newPlayer, privateGame)

    this.onCreate(socket, newPlayer, game)
  }

  async playRevealCard(socket: SkyjoSocket, turnData: PlayRevealCard) {
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

  async startGame(socket: SkyjoSocket, gameId: string) {
    const game = this.getGame(gameId)
    if (!game) return

    if (!game.isAdmin(socket.id)) return

    game.start()
    await this.broadcastGame(socket, gameId)
  }

  async pickCard(socket: SkyjoSocket, { gameId, pile }: PlayPickCard) {
    const { game } = this.checkPlayAuthorization(socket, gameId, [
      "chooseAPile",
    ])

    if (pile === "draw") game.drawCard()
    else game.pickFromDiscard()

    await this.broadcastGame(socket, gameId)
  }

  async replaceCard(
    socket: SkyjoSocket,
    { gameId, column, row }: PlayReplaceCard,
  ) {
    const { game, player } = this.checkPlayAuthorization(socket, gameId, [
      "replaceACard",
      "throwOrReplace",
    ])

    game.replaceCard(column, row)

    await this.finishTurn(socket, game, player)
    await this.broadcastGame(socket, gameId)
  }

  async discardCard(socket: SkyjoSocket, { gameId }: PlayDiscardSelectedCard) {
    const { game } = this.checkPlayAuthorization(socket, gameId, [
      "throwOrReplace",
    ])

    game.discardCard(game.selectedCard!)

    await this.broadcastGame(socket, gameId)
  }

  async turnCard(socket: SkyjoSocket, { gameId, column, row }: PlayTurnCard) {
    const { game, player } = this.checkPlayAuthorization(socket, gameId, [
      "turnACard",
    ])

    game.turnCard(player, column, row)

    await this.finishTurn(socket, game, player)
    await this.broadcastGame(socket, gameId)
  }
}
