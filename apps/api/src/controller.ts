import { PlaySkyjo } from "shared/validations/play"
import { CreatePlayer } from "shared/validations/player"
import { TurnCard } from "shared/validations/turnCard"
import { Socket } from "socket.io"
import { Skyjo } from "./class/Skyjo"
import { SkyjoGameController } from "./class/SkyjoGameController"
import { SkyjoPlayer } from "./class/SkyjoPlayer"
import { CardConstants } from "./constants"

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

  async turnCard(socket: Socket, turnData: TurnCard) {
    const { gameId, column, row } = turnData

    const game = this.getGame(gameId)
    if (!game) return

    const player = game.getPlayer(socket.id)
    if (!player) return

    if (player.hasTurnedCardCount(CardConstants.INITIAL_TURNED_COUNT)) return

    player.turnCard(column, row)

    game.checkAllPlayersTurnedCards(CardConstants.INITIAL_TURNED_COUNT)

    await this.broadcastGame(socket, gameId)
  }

  async startGame(socket: Socket, gameId: string) {
    const game = this.getGame(gameId)
    if (!game) return

    if (!game.isAdmin(socket.id)) return

    game.start()
    await this.broadcastGame(socket, gameId)
  }

  async play(socket: Socket, playData: PlaySkyjo) {
    const { gameId, actionType } = playData

    const game = this.getGame(gameId)
    if (
      !game ||
      game.status !== "playing" ||
      (game.roundState !== "start" && game.roundState !== "lastLap")
    )
      return

    const player = game.getPlayer(socket.id)
    if (!player) return

    if (!game.checkTurn(socket.id)) return

    switch (game.turnState) {
      case "chooseAPile":
        this.pickCardFromPile(game, actionType)
        break
      case "throwOrReplace":
      case "replaceACard":
        if (actionType === "replace") {
          this.replaceCard(socket, game, player, playData.column, playData.row)
        } else {
          game.discardCard(game.selectedCard!)
        }
        break
      case "turnACard":
        if (actionType === "turnACard")
          this.turnCardAfterThrowing(
            socket,
            game,
            player,
            playData.column,
            playData.row,
          )
        break
      default:
        console.log(
          `Invalid actionType ${actionType} for turnState ${game.turnState}`,
        )
    }

    await this.broadcastGame(socket, gameId)
  }

  private pickCardFromPile(game: Skyjo, actionType: PlaySkyjo["actionType"]) {
    if (actionType === "takeFromDrawPile") game.drawCard()
    else if (actionType === "takeFromDiscardPile") game.pickFromDiscard()
  }

  private replaceCard(
    socket: Socket,
    game: Skyjo,
    player: SkyjoPlayer,
    column: number,
    row: number,
  ) {
    game.replaceCard(column, row)

    this.checkEndTurn(socket, game, player)
  }

  private turnCardAfterThrowing(
    socket: Socket,
    game: Skyjo,
    player: SkyjoPlayer,
    column: number,
    row: number,
  ) {
    player.turnCard(column, row)

    this.checkEndTurn(socket, game, player)
  }

  private checkEndTurn(socket: Socket, game: Skyjo, player: SkyjoPlayer) {
    const cardsToDiscard = player.checkColumns()
    if (cardsToDiscard.length > 0) {
      cardsToDiscard.forEach((card) => game.discardCard(card))
    }

    // check if the player has turned all his cards
    const hasPlayerFinished = player.hasTurnedCardCount(
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
}
