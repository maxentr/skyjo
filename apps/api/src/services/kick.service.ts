import { Skyjo } from "@/class/Skyjo"
import { SkyjoSocket } from "@/types/skyjoSocket"
import { ERROR } from "shared/constants"
import { KickVote } from "shared/types/kickVote"
import { BaseService } from "./base.service"

export class KickService extends BaseService {
  private readonly kickVotes: Map<string, KickVote> = new Map()
  private readonly KICK_VOTE_THRESHOLD = 0.6 // 60%
  private readonly KICK_VOTE_EXPIRATION_TIME = 30000 // 30 seconds

  constructor() {
    super()
  }

  async onInitiateKickVote(socket: SkyjoSocket, playerToKickId: string) {
    const game = await this.getGame(socket.data.gameCode)
    await this.initiateKickVote(socket, game, playerToKickId)
  }

  async onVoteToKick(
    socket: SkyjoSocket,
    playerToKickId: string,
    vote: boolean,
  ) {
    const game = await this.getGame(socket.data.gameCode)

    const voter = game.getPlayerById(socket.data.playerId)
    if (!voter) throw new Error(ERROR.PLAYER_NOT_FOUND)

    const playerToKick = game.getPlayerById(playerToKickId)
    if (!playerToKick) throw new Error(ERROR.PLAYER_NOT_FOUND)

    const kickVote = this.kickVotes.get(playerToKick.id)
    if (!kickVote) throw new Error(ERROR.NO_KICK_VOTE_IN_PROGRESS)

    kickVote.votes.push({ playerId: voter.id, vote })

    await this.checkKickVoteStatus(socket, game, playerToKick.id)
  }

  //#region private methods
  private async initiateKickVote(
    socket: SkyjoSocket,
    game: Skyjo,
    playerId: string,
  ) {
    const initiator = game.getPlayerById(socket.data.playerId)
    if (!initiator) throw new Error(ERROR.PLAYER_NOT_FOUND)

    const playerToKick = game.getPlayerById(playerId)
    if (!playerToKick) throw new Error(ERROR.PLAYER_NOT_FOUND)

    if (this.kickVotes.has(playerToKick.id)) {
      throw new Error(ERROR.KICK_VOTE_IN_PROGRESS)
    }

    const connectedPlayers = game.getConnectedPlayers()

    const requiredVotes = Math.ceil(
      connectedPlayers.length * this.KICK_VOTE_THRESHOLD,
    )

    const kickVote: KickVote = {
      playerToKickId: playerToKick.id,
      initiatorId: initiator.id,
      votes: [{ playerId: initiator.id, vote: true }],
      requiredVotes,
      expiresAt: Date.now() + this.KICK_VOTE_EXPIRATION_TIME,
    }

    this.kickVotes.set(playerToKick.id, kickVote)

    this.broadcastKickVote(socket, game.code, "kick:vote", kickVote)
    await this.checkKickVoteStatus(socket, game, playerToKick.id)

    // Add timeout for vote expiration
    setTimeout(async () => {
      const currentKickVote = this.kickVotes.get(playerToKick.id)
      if (currentKickVote && currentKickVote.expiresAt <= Date.now()) {
        this.kickVotes.delete(playerToKick.id)
        await this.broadcastKickVote(
          socket,
          game.code,
          "kick:vote-failed",
          currentKickVote,
        )
      }
    }, this.KICK_VOTE_EXPIRATION_TIME)
  }

  private async checkKickVoteStatus(
    socket: SkyjoSocket,
    game: Skyjo,
    playerId: string,
  ) {
    const kickVote = this.kickVotes.get(playerId)
    if (!kickVote) return

    const yesVotes = kickVote.votes.filter((v) => v.vote).length
    const totalVotes = kickVote.votes.length

    const hasReachedRequiredVotes = yesVotes >= kickVote.requiredVotes
    const isExpired = Date.now() > kickVote.expiresAt
    const allVoted = totalVotes === game.getConnectedPlayers().length
    if (hasReachedRequiredVotes || allVoted || isExpired) {
      this.kickVotes.delete(playerId)

      if (yesVotes >= kickVote.requiredVotes) {
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
    const playerToKick = game.getPlayerById(kickVote.playerToKickId)
    if (!playerToKick) return

    game.removePlayer(playerToKick.id)
    await BaseService.playerDb.removePlayer(game.id, playerToKick.id)

    if (game.isAdmin(playerToKick.id)) {
      await this.changeAdmin(game)
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
    socket.to(gameCode).emit(event, kickVote)
    socket.emit(event, kickVote)
  }
  //#endregion
}
