import { KickService } from "@/services/kick.service"
import { logger } from "@/utils/logs"
import { SkyjoSocket } from "../types/skyjoSocket"

const instance = new KickService()

export const kickRouter = (socket: SkyjoSocket) => {
  socket.on("kick:initiate-vote", async (data: { playerToKickId: string }) => {
    try {
      const { playerToKickId } = data
      await instance.onInitiateKickVote(socket, playerToKickId)
    } catch (error) {
      logger.error(`Error while initiating a kick vote : ${error}`)
    }
  })

  socket.on(
    "kick:vote",
    async (data: { playerToKickId: string; vote: boolean }) => {
      try {
        const { playerToKickId, vote } = data
        await instance.onVoteToKick(socket, playerToKickId, vote)
      } catch (error) {
        logger.error(`Error while voting to kick a player : ${error}`)
      }
    },
  )
}
