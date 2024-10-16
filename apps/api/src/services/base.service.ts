import { Constants } from "@/constants"
import { GameDb } from "@/db/game.db"
import { PlayerDb } from "@/db/player.db"
import { CError } from "@/utils/CError"
import { Logger } from "@/utils/Logger"
import cron from "node-cron"
import {
  ERROR,
  GAME_STATUS,
  ROUND_STATUS,
  SERVER_MESSAGE_TYPE,
} from "shared/constants"
import { ServerChatMessage } from "shared/types/chat"
import { Skyjo } from "../class/Skyjo"
import { SkyjoPlayer } from "../class/SkyjoPlayer"
import { SkyjoSocket } from "../types/skyjoSocket"

export abstract class BaseService {
  private static firstInit = true

  protected static games: Skyjo[] = []
  protected static gameDb = new GameDb()
  protected static playerDb = new PlayerDb()

  constructor() {
    /* istanbul ignore next 3 -- @preserve */
    if (BaseService.firstInit) {
      BaseService.firstInit = false

      this.beforeStart()
    }
  }

  protected async getGame(gameCode: string) {
    let game = BaseService.games.find((game) => game.code === gameCode)

    if (!game) {
      game = await BaseService.gameDb.retrieveGameByCode(gameCode)
      if (!game) {
        throw new CError(
          `Someone try to get game but it doesn't exist in memory nor in database`,
          {
            code: ERROR.GAME_NOT_FOUND,
            level: "warn",
            meta: {
              gameCode,
            },
          },
        )
      }

      BaseService.games.push(game)
    }

    return game
  }

  protected async sendGame(socket: SkyjoSocket, game: Skyjo) {
    socket.emit("game", game.toJson())
  }

  protected async broadcastGame(socket: SkyjoSocket, game: Skyjo) {
    await this.sendGame(socket, game)
    socket.to(game.code).emit("game", game.toJson())
  }

  protected async joinGame(
    socket: SkyjoSocket,
    game: Skyjo,
    player: SkyjoPlayer,
    reconnection: boolean = false,
  ) {
    await socket.join(game.code)

    socket.data = {
      gameCode: game.code,
      playerId: player.id,
    }

    socket.emit("join", game.toJson(), player.id)

    const messageType = reconnection
      ? SERVER_MESSAGE_TYPE.PLAYER_RECONNECT
      : SERVER_MESSAGE_TYPE.PLAYER_JOINED
    const message: ServerChatMessage = {
      id: crypto.randomUUID(),
      username: player.name,
      message: messageType,
      type: messageType,
    }
    socket.to(game.code).emit("message:server", message)
    socket.emit("message:server", message)

    const updateGame = BaseService.gameDb.updateGame(game)
    const broadcast = this.broadcastGame(socket, game)

    await Promise.all([updateGame, broadcast])
  }

  protected async changeAdmin(game: Skyjo) {
    const players = game.getConnectedPlayers([game.adminId])
    if (players.length === 0) return

    const player = players[0]
    await BaseService.gameDb.updateAdmin(game.id, player.id)

    game.adminId = player.id
  }

  protected async removeGame(gameCode: string) {
    BaseService.games = BaseService.games.filter(
      (game) => game.code !== gameCode,
    )
    await BaseService.gameDb.removeGame(gameCode)
  }

  protected async finishTurn(socket: SkyjoSocket, game: Skyjo) {
    game.nextTurn()
    const player = game.getCurrentPlayer()
    BaseService.playerDb.updatePlayer(player)

    if (
      game.roundStatus === ROUND_STATUS.OVER &&
      game.status !== GAME_STATUS.FINISHED
    ) {
      this.restartRound(socket, game)
    }

    const updateGame = BaseService.gameDb.updateGame(game)
    const broadcast = this.broadcastGame(socket, game)

    await Promise.all([updateGame, broadcast])
  }

  protected async restartRound(socket: SkyjoSocket, game: Skyjo) {
    setTimeout(() => {
      game.startNewRound()
      this.broadcastGame(socket, game)
    }, Constants.NEW_ROUND_DELAY)
  }

  //#region private methods
  /* istanbul ignore next function -- @preserve */
  private async beforeStart() {
    await BaseService.gameDb.removeInactiveGames()
    BaseService.games = await BaseService.gameDb.getGamesByRegion()

    this.startCronJob()
  }

  /* istanbul ignore next function -- @preserve */
  private startCronJob() {
    cron.schedule("* * * * *", () => {
      this.removeInactiveGames()
    })
  }

  /* istanbul ignore next function -- @preserve */
  private async removeInactiveGames() {
    Logger.info("Remove inactive games")
    try {
      const deletedGameIds = await BaseService.gameDb.removeInactiveGames()

      BaseService.games = BaseService.games.filter(
        (game) => !deletedGameIds.includes(game.id),
      )
    } catch (error) {
      Logger.error("Error while removing inactive games", {
        error,
      })
    }
  }
  //#endregion
}
