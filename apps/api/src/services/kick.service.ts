import { Skyjo } from "@/class/Skyjo"
import { SkyjoSocket } from "@/types/skyjoSocket"
import { ERROR } from "shared/constants"
import { KickVote } from "shared/types/KickVote"
import { BaseService } from "./base.service"

export class KickService extends BaseService {
  private readonly kickVotes: Map<string, KickVote> = new Map()
  private readonly KICK_VOTE_THRESHOLD = 0.6 // 60%
  private readonly KICK_VOTE_EXPIRATION_TIME = 30000 // 30 seconds

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

    kickVote.votes.set(voter.id, vote)
    await this.checkKickVoteStatus(socket, game, playerToKick.id)
  }

  async initiateKickVote(socket: SkyjoSocket, game: Skyjo, playerId: string) {
    const initiator = game.getPlayerById(socket.data.playerId)
    console.log("initiator", initiator)
    if (!initiator) throw new Error(ERROR.PLAYER_NOT_FOUND)

    const playerToKick = game.getPlayerById(playerId)
    console.log("playerToKick", playerToKick)
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
      votes: new Map([[initiator.id, true]]),
      requiredVotes,
      expiresAt: Date.now() + this.KICK_VOTE_EXPIRATION_TIME,
    }

    // TODO reflechir a ce que je renvoie au client. Afficher le nombre de vote sur requiredVotes dans le toast front. Tester tout ça.

    this.kickVotes.set(playerToKick.id, kickVote)

    socket.emit("kick:vote-started", kickVote)
    socket.to(game.code).emit("kick:vote-started", kickVote)
    await this.checkKickVoteStatus(socket, game, playerToKick.id)
  }

  private async checkKickVoteStatus(
    socket: SkyjoSocket,
    game: Skyjo,
    playerId: string,
  ) {
    const kickVote = this.kickVotes.get(playerId)
    console.log("kickVote", this.kickVotes, playerId, kickVote)
    if (!kickVote) return

    const yesVotes = Array.from(kickVote.votes.values()).filter((v) => v).length
    const totalVotes = kickVote.votes.size

    if (
      yesVotes >= kickVote.requiredVotes ||
      totalVotes === game.getConnectedPlayers().length ||
      Date.now() > kickVote.expiresAt
    ) {
      this.kickVotes.delete(playerId)

      if (yesVotes >= kickVote.requiredVotes) {
        await this.kickPlayer(socket, game, playerId)
      } else {
        socket.to(game.code).emit("kick:vote-failed", kickVote)
      }
    }
  }

  private async kickPlayer(socket: SkyjoSocket, game: Skyjo, playerId: string) {
    const playerToKick = game.getPlayerById(playerId)
    if (!playerToKick) return

    game.removePlayer(playerToKick.id)
    await this.playerDb.removePlayer(game.id, playerToKick.id)

    if (game.isAdmin(playerToKick.id)) {
      await this.changeAdmin(game)
    }

    socket
      .to(game.code)
      .emit("kick:player-kicked", { username: playerToKick.name })
    socket.to(playerToKick.socketId).emit("kick:you-were-kicked")

    const updateGame = this.gameDb.updateGame(game)
    const broadcast = this.broadcastGame(socket, game)

    await Promise.all([updateGame, broadcast])
  }
}
