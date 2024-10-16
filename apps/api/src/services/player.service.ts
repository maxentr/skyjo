import { Skyjo } from "@/class/Skyjo"
import { SkyjoPlayer } from "@/class/SkyjoPlayer"
import { SkyjoSocket } from "@/types/skyjoSocket"
import { CError } from "@/utils/CError"
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
    if (!player) {
      throw new CError(
        `Player try to leave a game but he has not been found.`,
        {
          code: ERROR.PLAYER_NOT_FOUND,
          level: "warn",
          meta: { game, gameCode: game.code, playerId: socket.data.playerId },
        },
      )
    }

    player.connectionStatus = timeout
      ? CONNECTION_STATUS.CONNECTION_LOST
      : CONNECTION_STATUS.LEAVE

    await BaseService.playerDb.updatePlayer(player)

    if (game.isAdmin(player.id)) await this.changeAdmin(game)

    if (
      game.status === GAME_STATUS.LOBBY ||
      game.status === GAME_STATUS.FINISHED ||
      game.status === GAME_STATUS.STOPPED
    ) {
      game.removePlayer(player.id)
      await BaseService.playerDb.removePlayer(game.id, player.id)

      game.restartGameIfAllPlayersWantReplay()

      const promises: Promise<void>[] = []

      if (game.getConnectedPlayers().length === 0) {
        const removeGame = this.removeGame(game.code)
        promises.push(removeGame)
      } else {
        const updateGame = BaseService.gameDb.updateGame(game)
        promises.push(updateGame)
      }

      const broadcast = this.broadcastGame(socket, game)
      promises.push(broadcast)

      await Promise.all(promises)
    } else {
      await this.startDisconnectionTimeout(
        player,
        timeout,
        async () => await this.updateGameAfterTimeoutExpired(socket, game),
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
    const isPlayerInGame = await BaseService.gameDb.isPlayerInGame(
      reconnectData.gameCode,
      reconnectData.playerId,
    )
    if (!isPlayerInGame) {
      throw new CError(
        `Player try to reconnect but he has not been found in the game.`,
        {
          code: ERROR.PLAYER_NOT_FOUND,
          level: "warn",
          meta: {
            gameCode: reconnectData.gameCode,
            playerId: reconnectData.playerId,
          },
        },
      )
    }

    const canReconnect = await BaseService.playerDb.canReconnect(
      reconnectData.playerId,
    )
    if (!canReconnect) {
      throw new CError(`Player try to reconnect but he cannot reconnect.`, {
        code: ERROR.CANNOT_RECONNECT,
        level: "warn",
        meta: {
          gameCode: reconnectData.gameCode,
          playerId: reconnectData.playerId,
        },
      })
    }

    await BaseService.playerDb.updateSocketId(reconnectData.playerId, socket.id)

    const game = await this.getGame(reconnectData.gameCode)

    const player = game.getPlayerById(reconnectData.playerId)!

    if (player.disconnectionTimeout) clearTimeout(player.disconnectionTimeout)
    player.socketId = socket.id
    player.connectionStatus = CONNECTION_STATUS.CONNECTED

    const updatePlayer = BaseService.playerDb.reconnectPlayer(player)
    const joinGame = this.joinGame(socket, game, player, true)

    await Promise.all([updatePlayer, joinGame])
  }

  //#region private methods
  private async startDisconnectionTimeout(
    player: SkyjoPlayer,
    connectionLost: boolean,
    callback: (...args: unknown[]) => Promise<unknown>,
  ) {
    player.connectionStatus = connectionLost
      ? CONNECTION_STATUS.CONNECTION_LOST
      : CONNECTION_STATUS.LEAVE
    await BaseService.playerDb.updateDisconnectionDate(player, new Date())

    player.disconnectionTimeout = setTimeout(
      async () => {
        player.connectionStatus = CONNECTION_STATUS.DISCONNECTED
        await callback()
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

    if (game.getCurrentPlayer()?.id === socket.data.playerId)
      await this.finishTurn(socket, game)

    if (game.roundStatus === ROUND_STATUS.WAITING_PLAYERS_TO_TURN_INITIAL_CARDS)
      game.checkAllPlayersRevealedCards(game.settings.initialTurnedCount)

    const updateGame = BaseService.gameDb.updateGame(game)
    const broadcast = this.broadcastGame(socket, game)

    await Promise.all([updateGame, broadcast])
  }
  //#endregion
}
