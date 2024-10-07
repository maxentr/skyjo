import { GameDb } from "@/db/game.db"
import { PlayerDb } from "@/db/player.db"
import { logger } from "@/utils/logs"
import cron from "node-cron"
import { ERROR, SERVER_MESSAGE_TYPE } from "shared/constants"
import { ServerChatMessage } from "shared/types/chat"
import { Skyjo } from "../class/Skyjo"
import { SkyjoPlayer } from "../class/SkyjoPlayer"
import { SkyjoSocket } from "../types/skyjoSocket"

export abstract class BaseService {
  protected readonly gameDb = new GameDb()
  protected readonly playerDb = new PlayerDb()
  protected static games: Skyjo[] = []
  protected static firstInit = true

  constructor() {
    if (BaseService.firstInit) {
      BaseService.firstInit = false

      this.beforeStart()
    }
  }

  protected async getGame(gameCode: string) {
    let game = BaseService.games.find((game) => game.code === gameCode)

    if (!game) {
      game = await this.gameDb.retrieveGameByCode(gameCode)
      if (!game) throw new Error(ERROR.GAME_NOT_FOUND)
    }

    BaseService.games.push(game)
    return game
  }

  protected async broadcastGame(socket: SkyjoSocket, game: Skyjo) {
    socket.emit("game", game.toJson())

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

    const updateGame = this.gameDb.updateGame(game)
    const broadcast = this.broadcastGame(socket, game)

    await Promise.all([updateGame, broadcast])
  }

  protected async changeAdmin(game: Skyjo) {
    const players = game.getConnectedPlayers([game.adminId])
    if (players.length === 0) return

    const player = players[0]
    await this.gameDb.updateAdmin(game.id, player.id)

    game.adminId = player.id
  }

  //#region private methods
  private async beforeStart() {
    await this.gameDb.removeInactiveGames()
    BaseService.games = await this.gameDb.getGamesByRegion()

    this.startCronJob()
  }

  private startCronJob() {
    cron.schedule("* * * * *", () => {
      this.removeInactiveGames()
    })
  }

  private async removeInactiveGames() {
    logger.info("Remove inactive games")
    const deletedGameIds = await this.gameDb.removeInactiveGames()

    BaseService.games = BaseService.games.filter(
      (game) => !deletedGameIds.includes(game.id),
    )
  }
  //#endregion
}
