import { Skyjo } from "@/class/Skyjo"
import { SkyjoPlayer } from "@/class/SkyjoPlayer"
import { SkyjoSocket } from "@/types/skyjoSocket"
import {
  CONNECTION_LOST_TIMEOUT_IN_MS,
  CONNECTION_STATUS,
  ERROR,
  GAME_STATUS,
  LEAVE_TIMEOUT_IN_MS,
  ROUND_STATUS,
  SERVER_MESSAGE_TYPE,
} from "shared/constants"
import { LastGame } from "shared/validations/reconnect"
import { BaseService } from "./base.service"

export class PlayerService extends BaseService {
  async onLeave(socket: SkyjoSocket, timeout: boolean = false) {
    const game = await this.getGame(socket.data.gameCode)

    const player = game.getPlayerById(socket.data.playerId)
    if (!player) throw new Error(ERROR.PLAYER_NOT_FOUND)

    player.connectionStatus = timeout
      ? CONNECTION_STATUS.CONNECTION_LOST
      : CONNECTION_STATUS.LEAVE
    await this.playerDb.updatePlayer(player)

    if (game.isAdmin(player.id)) await this.changeAdmin(game)

    if (
      game.status === GAME_STATUS.LOBBY ||
      game.status === GAME_STATUS.FINISHED ||
      game.status === GAME_STATUS.STOPPED
    ) {
      game.removePlayer(player.id)
      await this.playerDb.removePlayer(game.id, player.id)

      // TODO do a function to clean up players. It will remove every player that are disconnected

      game.restartGameIfAllPlayersWantReplay()

      const promises: Promise<void>[] = []

      if (game.getConnectedPlayers().length === 0) {
        const removeGame = this.removeGame(game.code)
        promises.push(removeGame)
      } else {
        const updateGame = this.gameDb.updateGame(game)
        promises.push(updateGame)
      }

      const broadcast = this.broadcastGame(socket, game)
      promises.push(broadcast)

      await Promise.all(promises)
    } else {
      this.startDisconnectionTimeout(player, timeout, () =>
        this.updateGameAfterTimeoutExpired(socket, game),
      )
    }

    socket.to(game.code).emit("message:server", {
      id: crypto.randomUUID(),
      username: player.name,
      message: SERVER_MESSAGE_TYPE.PLAYER_LEFT,
      type: SERVER_MESSAGE_TYPE.PLAYER_LEFT,
    })

    await socket.leave(game.code)
  }

  async onReconnect(socket: SkyjoSocket, reconnectData: LastGame) {
    const isPlayerInGame = await this.gameDb.isPlayerInGame(
      reconnectData.gameCode,
      reconnectData.playerId,
    )
    if (!isPlayerInGame) throw new Error(ERROR.PLAYER_NOT_FOUND)

    const canReconnect = await this.playerDb.canReconnect(
      reconnectData.playerId,
    )
    if (!canReconnect) throw new Error(ERROR.CANNOT_RECONNECT)

    await this.playerDb.updateSocketId(reconnectData.playerId, socket.id)

    const game = await this.getGame(reconnectData.gameCode)

    const player = game.getPlayerById(reconnectData.playerId)!

    if (player.disconnectionTimeout) clearTimeout(player.disconnectionTimeout)
    player.socketId = socket.id
    player.connectionStatus = CONNECTION_STATUS.CONNECTED

    const updatePlayer = this.playerDb.reconnectPlayer(player)
    const joinGame = this.joinGame(socket, game, player, true)

    await Promise.all([updatePlayer, joinGame])
  }

  //#region private methods
  private startDisconnectionTimeout(
    player: SkyjoPlayer,
    connectionLost: boolean,
    callback: (...args: unknown[]) => Promise<unknown>,
  ) {
    player.connectionStatus = connectionLost
      ? CONNECTION_STATUS.CONNECTION_LOST
      : CONNECTION_STATUS.LEAVE
    this.playerDb.updateDisconnectionDate(player, new Date())

    player.disconnectionTimeout = setTimeout(
      () => {
        player.connectionStatus = CONNECTION_STATUS.DISCONNECTED
        callback()
      },
      connectionLost ? CONNECTION_LOST_TIMEOUT_IN_MS : LEAVE_TIMEOUT_IN_MS,
    )
  }

  private async updateGameAfterTimeoutExpired(
    socket: SkyjoSocket,
    game: Skyjo,
  ) {
    if (!game.haveAtLeastMinPlayersConnected()) {
      game.status = GAME_STATUS.STOPPED

      const removeGame = this.removeGame(game.code)
      const broadcast = this.broadcastGame(socket, game)

      await Promise.all([removeGame, broadcast])
      return
    }

    if (game.getCurrentPlayer()?.id === socket.data.playerId) game.nextTurn()

    if (game.roundStatus === ROUND_STATUS.WAITING_PLAYERS_TO_TURN_INITIAL_CARDS)
      game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)
    else if (
      game.roundStatus === ROUND_STATUS.LAST_LAP &&
      game.allConnectedPlayersHavePlayedLastTurn()
    ) {
      game.endRound()
    }

    const updateGame = this.gameDb.updateGame(game)
    const broadcast = this.broadcastGame(socket, game)

    await Promise.all([updateGame, broadcast])
  }

  private async removeGame(gameCode: string) {
    this.games = this.games.filter((game) => game.code !== gameCode)
    await this.gameDb.removeGame(gameCode)
  }
  //#endregion
}
