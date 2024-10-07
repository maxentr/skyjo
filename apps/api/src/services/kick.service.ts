import { KickVoteController } from "@/class/KickVoteController"
import { SkyjoSocket } from "@/types/skyjoSocket"
import { BaseService } from "./base.service"

export class KickService extends BaseService {
  private readonly kickVoteController: KickVoteController =
    new KickVoteController(this.playerDb, this.gameDb)

  async onInitiateKickVote(socket: SkyjoSocket, playerToKickId: string) {
    const game = await this.getGame(socket.data.gameCode)
    await this.kickVoteController.initiateKickVote(socket, game, playerToKickId)
  }

  async onVoteToKick(
    socket: SkyjoSocket,
    playerToKickId: string,
    vote: boolean,
  ) {
    const game = await this.getGame(socket.data.gameCode)
    await this.kickVoteController.voteToKick(socket, game, playerToKickId, vote)
  }
}
