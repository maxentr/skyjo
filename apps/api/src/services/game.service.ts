import { Skyjo } from "@/class/Skyjo"
import { SkyjoSocket } from "@/types/skyjoSocket"
import {
  ERROR,
  GAME_STATUS,
  ROUND_STATUS,
  TURN_STATUS,
  TurnStatus,
} from "shared/constants"
import {
  PlayPickCard,
  PlayReplaceCard,
  PlayRevealCard,
  PlayTurnCard,
} from "shared/validations/play"
import { BaseService } from "./base.service"

export class GameService extends BaseService {
  constructor() {
    super()
  }

  async onGet(socket: SkyjoSocket) {
    const game = await this.getGame(socket.data.gameCode)

    socket.emit("game", game.toJson())
  }

  async onRevealCard(socket: SkyjoSocket, turnData: PlayRevealCard) {
    const { column, row } = turnData
    const gameCode = socket.data.gameCode

    const game = await this.getGame(gameCode)

    const player = game.getPlayerById(socket.data.playerId)
    if (!player) throw new Error(ERROR.PLAYER_NOT_FOUND)

    if (
      game.status !== GAME_STATUS.PLAYING ||
      game.roundStatus !== ROUND_STATUS.WAITING_PLAYERS_TO_TURN_INITIAL_CARDS
    )
      throw new Error(ERROR.NOT_ALLOWED)

    if (player.hasRevealedCardCount(game.settings.initialTurnedCount)) return

    player.turnCard(column, row)

    game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)

    const updateGame = this.gameDb.updateGame(game)
    const broadcast = this.broadcastGame(socket, game)

    await Promise.all([updateGame, broadcast])
  }

  async onPickCard(socket: SkyjoSocket, { pile }: PlayPickCard) {
    const { game } = await this.checkPlayAuthorization(socket, [
      TURN_STATUS.CHOOSE_A_PILE,
    ])

    if (pile === "draw") game.drawCard()
    else game.pickFromDiscard()

    const updateGame = this.gameDb.updateGame(game)
    const broadcast = this.broadcastGame(socket, game)

    await Promise.all([updateGame, broadcast])
  }

  async onReplaceCard(socket: SkyjoSocket, { column, row }: PlayReplaceCard) {
    const { game } = await this.checkPlayAuthorization(socket, [
      TURN_STATUS.REPLACE_A_CARD,
      TURN_STATUS.THROW_OR_REPLACE,
    ])

    game.replaceCard(column, row)

    const updateGame = this.gameDb.updateGame(game)
    const broadcast = this.broadcastGame(socket, game)

    await Promise.all([updateGame, broadcast])

    await this.finishTurn(socket, game)
  }

  async onDiscardCard(socket: SkyjoSocket) {
    const { game } = await this.checkPlayAuthorization(socket, [
      TURN_STATUS.THROW_OR_REPLACE,
    ])

    game.discardCard(game.selectedCardValue!)

    const updateGame = this.gameDb.updateGame(game)
    const broadcast = this.broadcastGame(socket, game)

    await Promise.all([updateGame, broadcast])
  }

  async onTurnCard(socket: SkyjoSocket, { column, row }: PlayTurnCard) {
    const { game, player } = await this.checkPlayAuthorization(socket, [
      TURN_STATUS.TURN_A_CARD,
    ])

    game.turnCard(player, column, row)

    await this.broadcastGame(socket, game)

    await this.finishTurn(socket, game)
  }

  //#region private methods

  private async checkPlayAuthorization(
    socket: SkyjoSocket,
    allowedStates: TurnStatus[],
  ) {
    const game = await this.getGame(socket.data.gameCode)

    if (
      game.status !== GAME_STATUS.PLAYING ||
      (game.roundStatus !== ROUND_STATUS.PLAYING &&
        game.roundStatus !== ROUND_STATUS.LAST_LAP)
    )
      throw new Error(ERROR.NOT_ALLOWED)

    const player = game.getPlayerById(socket.data.playerId)
    if (!player) throw new Error(`player-not-found`)

    if (!game.checkTurn(player.id)) throw new Error(`not-your-turn`)

    if (allowedStates.length > 0 && !allowedStates.includes(game.turnStatus))
      throw new Error(ERROR.INVALID_TURN_STATE)

    return { player, game }
  }

  private async finishTurn(socket: SkyjoSocket, game: Skyjo) {
    game.nextTurn()
    const player = game.getCurrentPlayer()
    this.playerDb.updatePlayer(player)

    if (
      game.roundStatus === ROUND_STATUS.OVER &&
      game.status !== GAME_STATUS.FINISHED
    ) {
      setTimeout(() => {
        game.startNewRound()
        this.broadcastGame(socket, game)
      }, 10000)
    }

    const updateGame = this.gameDb.updateGame(game)
    const broadcast = this.broadcastGame(socket, game)

    await Promise.all([updateGame, broadcast])
  }
  //#endregion
}
