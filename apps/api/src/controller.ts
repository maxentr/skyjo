import { Socket } from "socket.io"
import { GameController } from "./class/GameController"
import { Skyjo } from "./class/Skyjo"
import { SkyjoPlayer } from "./class/SkyjoPlayer"
import {
  PlaySkyjo,
  PlaySkyjoReplace,
  PlaySkyjoTurnCard,
} from "shared/validations/play"
import { CreatePlayer } from "shared/validations/player"
import { TurnCard } from "shared/validations/turnCard"

export default class SkyjoController extends GameController {
  private static instance: SkyjoController

  static getInstance(): SkyjoController {
    if (!SkyjoController.instance) {
      SkyjoController.instance = new SkyjoController()
    }

    return SkyjoController.instance
  }

  async create(socket: Socket, player: CreatePlayer, isPrivate = true) {
    const game = new Skyjo(isPrivate)

    const newPlayer = new SkyjoPlayer(player.username, socket.id, player.avatar)

    this.onCreate(socket, newPlayer, game)
  }

  async turnCard(socket: Socket, data: TurnCard) {
    const game = this.getGame(data.gameId)
    if (!game) return

    const player = game.getPlayer(socket.id)
    if (!player) return

    if (player.hasTurnedSpecifiedNumberOfCards()) return

    player.turnCard(data.cardColumnIndex, data.cardRowIndex)

    game.checkIfAllPlayersTurnedAmountOfCards()

    this.sendGame(socket, data.gameId)
  }

  async play(socket: Socket, data: PlaySkyjo) {
    const game = this.getGame(data.gameId)
    if (
      !game ||
      game.status !== "playing" ||
      (game.roundState !== "start" && game.roundState !== "lastLap")
    )
      return

    const player = game.getPlayer(socket.id)
    if (!player) return

    if (!game.checkTurn(socket.id)) return

    if (game.turnState === "chooseAPile") {
      this.pickCardFromPile(game, data.actionType)
    } else if (
      data.actionType === "replace" &&
      (game.turnState === "throwOrReplace" || game.turnState === "replaceACard")
    ) {
      this.replaceCard(socket, game, player, data)
    } else if (
      data.actionType === "throwSelectedCard" &&
      game.turnState === "throwOrReplace"
    ) {
      game.putCardInDiscardPile(game.selectedCard!)
    } else if (
      data.actionType === "turnACard" &&
      game.turnState === "turnACard"
    ) {
      this.turnCardAfterThrowing(socket, game, player, data)
    } else {
      throw new Error(
        `Invalid actionType ${data.actionType} for turnState ${game.turnState}`,
      )
    }

    this.sendGame(socket, data.gameId)
  }

  private pickCardFromPile(game: Skyjo, actionType: PlaySkyjo["actionType"]) {
    if (actionType === "takeFromDrawPile") game.pickCardFromDrawPile()
    else if (actionType === "takeFromDiscardPile")
      game.pickCardFromDiscardPile()
  }

  private replaceCard(
    socket: Socket,
    game: Skyjo,
    player: SkyjoPlayer,
    data: PlaySkyjoReplace,
  ) {
    game.replaceCard(data.cardColumnIndex, data.cardRowIndex)

    this.checkEndTurn(socket, game, player)
  }

  private turnCardAfterThrowing(
    socket: Socket,
    game: Skyjo,
    player: SkyjoPlayer,
    data: PlaySkyjoTurnCard,
  ) {
    player.turnCard(data.cardColumnIndex, data.cardRowIndex)

    this.checkEndTurn(socket, game, player)
  }

  private checkEndTurn(socket: Socket, game: Skyjo, player: SkyjoPlayer) {
    const cardsToDiscard = player.checkColumns()
    if (cardsToDiscard.length > 0) {
      cardsToDiscard.forEach((card) => game.putCardInDiscardPile(card))
    }

    // check if the player has turned all his cards
    const hasPlayerFinished = player.hasTurnedAllCards()
    if (hasPlayerFinished && !game.firstPlayerToFinish) {
      game.firstPlayerToFinish = player
      game.roundState = "lastLap"
    } else if (game.firstPlayerToFinish) {
      // check if the turn comes to the first player who finished
      game.checkRoundEnd()
      // check if the game is finished (player with more than 100 points)
      game.checkEndGame()

      // if the round is over and the game is not finished, start a new round after 10 seconds
      if (game.roundState === "over" && game.status !== "finished") {
        setTimeout(() => {
          game.newRound()
          this.sendGame(socket, game.id)
        }, 10000)
      }
    }

    // next turn
    game.nextTurn()
  }
}
