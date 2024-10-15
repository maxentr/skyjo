import { KickVote } from "@/class/KickVote"
import { Skyjo } from "@/class/Skyjo"
import { Constants } from "@/constants"
import { SkyjoSocket } from "@/types/skyjoSocket"
import { CONNECTION_STATUS, ERROR, GAME_STATUS } from "shared/constants"
import { BaseService } from "./base.service"

export class KickService extends BaseService {
  private readonly kickVotes: Map<string, KickVote> = new Map()

  constructor() {
    super()
  }

  async onInitiateKickVote(socket: SkyjoSocket, targetId: string) {
    const game = await this.getGame(socket.data.gameCode)
    await this.initiateKickVote(socket, game, targetId)
  }

  async onVoteToKick(socket: SkyjoSocket, vote: boolean) {
    const game = await this.getGame(socket.data.gameCode)

    const player = game.getPlayerById(socket.data.playerId)
    if (!player)
      throw new Error(ERROR.PLAYER_NOT_FOUND, {
        cause: `Tried to vote to kick but player ${socket.data.playerId} not found in game ${game.id}. This can happen if the player left the game before the vote ended.`,
      })

    const kickVote = this.kickVotes.get(game.id)
    if (!kickVote) throw new Error(ERROR.NO_KICK_VOTE_IN_PROGRESS)

    if (kickVote.hasPlayerVoted(player.id))
      throw new Error(ERROR.PLAYER_ALREADY_VOTED)

    kickVote.addVote(player.id, vote)

    await this.checkKickVoteStatus(socket, game, kickVote)
  }

  //#region private methods
  private async initiateKickVote(
    socket: SkyjoSocket,
    game: Skyjo,
    targetId: string,
  ) {
    const initiator = game.getPlayerById(socket.data.playerId)
    if (!initiator)
      throw new Error(ERROR.PLAYER_NOT_FOUND, {
        cause: `Tried to initiate a kick vote with player ${socket.data.playerId} as initiator but player not found in game ${game.id}. This can happen if the player left the game before the vote started.`,
      })

    const target = game.getPlayerById(targetId)
    if (!target)
      throw new Error(ERROR.PLAYER_NOT_FOUND, {
        cause: `Tried to initiate a kick vote with player ${targetId} as target but player not found in game ${game.id}. This can happen if the player left the game before the vote started.`,
      })

    if (this.kickVotes.has(game.id))
      throw new Error(ERROR.KICK_VOTE_IN_PROGRESS)

    const kickVote = new KickVote(game, target.id, initiator.id)

    this.kickVotes.set(game.id, kickVote)

    this.broadcastKickVote(socket, game.code, "kick:vote", kickVote)
    await this.checkKickVoteStatus(socket, game, kickVote)

    // Add timeout for vote expiration
    kickVote.timeout = setTimeout(async () => {
      await this.checkKickVoteStatus(socket, game, kickVote)
    }, Constants.KICK_VOTE_EXPIRATION_TIME)
  }

  private async checkKickVoteStatus(
    socket: SkyjoSocket,
    game: Skyjo,
    kickVote: KickVote,
  ) {
    if (
      kickVote.hasReachedRequiredVotes() ||
      kickVote.allPlayersVotedExceptTarget() ||
      kickVote.hasExpired()
    ) {
      /* istanbul ignore else --@preserve */
      if (kickVote.timeout) clearTimeout(kickVote.timeout)
      this.kickVotes.delete(game.id)

      if (kickVote.hasReachedRequiredVotes()) {
        await this.kickPlayer(socket, game, kickVote)
      } else {
        await this.broadcastKickVote(
          socket,
          game.code,
          "kick:vote-failed",
          kickVote,
        )
      }
    } else {
      await this.broadcastKickVote(socket, game.code, "kick:vote", kickVote)
    }
  }

  private async kickPlayer(
    socket: SkyjoSocket,
    game: Skyjo,
    kickVote: KickVote,
  ) {
    const playerToKick = game.getPlayerById(kickVote.targetId)
    if (!playerToKick)
      throw new Error(ERROR.PLAYER_NOT_FOUND, {
        cause: `Tried to kick player ${kickVote.targetId} but player not found in game ${game.id}. This can happen if the player left the game before the vote ended.`,
      })

    playerToKick.connectionStatus = CONNECTION_STATUS.DISCONNECTED
    await BaseService.playerDb.updatePlayer(playerToKick)

    if (game.isAdmin(playerToKick.id)) await this.changeAdmin(game)

    if (
      game.status === GAME_STATUS.LOBBY ||
      game.status === GAME_STATUS.FINISHED ||
      game.status === GAME_STATUS.STOPPED
    ) {
      game.removePlayer(playerToKick.id)
      await BaseService.playerDb.removePlayer(game.id, playerToKick.id)
    }

    await this.broadcastKickVote(
      socket,
      game.code,
      "kick:vote-success",
      kickVote,
    )

    const updateGame = BaseService.gameDb.updateGame(game)
    const broadcast = this.broadcastGame(socket, game)

    await Promise.all([updateGame, broadcast])
  }

  private async broadcastKickVote(
    socket: SkyjoSocket,
    gameCode: string,
    event: "kick:vote" | "kick:vote-success" | "kick:vote-failed",
    kickVote: KickVote,
  ) {
    socket.to(gameCode).emit(event, kickVote.toJson())
    socket.emit(event, kickVote.toJson())
  }
  //#endregion
}
