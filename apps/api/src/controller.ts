import { ChangeSettings } from "shared/validations/changeSettings"
import {
  PlayPickCard,
  PlayReplaceCard,
  PlayRevealCard,
  PlayTurnCard,
} from "shared/validations/play"
import { CreatePlayer } from "shared/validations/player"
import { Skyjo } from "./class/Skyjo"
import { SkyjoGameController } from "./class/SkyjoGameController"
import { SkyjoPlayer } from "./class/SkyjoPlayer"
import { SkyjoSettings } from "./class/SkyjoSettings"
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
    const settings = new SkyjoSettings(privateGame)

    const game = new Skyjo(newPlayer, settings)

    this.onCreate(socket, newPlayer, game)
  }

  async playRevealCard(socket: SkyjoSocket, turnData: PlayRevealCard) {
    const { column, row } = turnData
    const gameId = socket.data.gameId

    const game = this.getGame(gameId)
    if (!game) return

    const player = game.getPlayer(socket.id)
    if (!player) return

    if (player.hasRevealedCardCount(game.settings.initialTurnedCount)) return

    player.turnCard(column, row)

    game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)

    await this.broadcastGame(socket)
  }

  async changeSettings(socket: SkyjoSocket, settings: ChangeSettings) {
    const game = this.getGame(socket.data.gameId)
    if (!game) return

    game.settings.changeSettings(settings)

    await this.broadcastGame(socket)
  }

  async startGame(socket: SkyjoSocket) {
    const game = this.getGame(socket.data.gameId)
    if (!game) return

    if (!game.isAdmin(socket.id)) return

    game.start()
    await this.broadcastGame(socket)
  }

  async pickCard(socket: SkyjoSocket, { pile }: PlayPickCard) {
    const { game } = this.checkPlayAuthorization(socket, ["chooseAPile"])

    if (pile === "draw") game.drawCard()
    else game.pickFromDiscard()

    await this.broadcastGame(socket)
  }

  async replaceCard(socket: SkyjoSocket, { column, row }: PlayReplaceCard) {
    const { game, player } = this.checkPlayAuthorization(socket, [
      "replaceACard",
      "throwOrReplace",
    ])

    game.replaceCard(column, row)

    await this.finishTurn(socket, game, player)
    await this.broadcastGame(socket)
  }

  async discardCard(socket: SkyjoSocket) {
    const { game } = this.checkPlayAuthorization(socket, ["throwOrReplace"])

    game.discardCard(game.selectedCard!)

    await this.broadcastGame(socket)
  }

  async turnCard(socket: SkyjoSocket, { column, row }: PlayTurnCard) {
    const { game, player } = this.checkPlayAuthorization(socket, ["turnACard"])

    game.turnCard(player, column, row)

    await this.finishTurn(socket, game, player)
    await this.broadcastGame(socket)
  }
}
