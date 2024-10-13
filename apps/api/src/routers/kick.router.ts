import { KickService } from "@/services/kick.service"
import { Logger } from "@/utils/logs"
import {
  InitiateKickVote,
  VoteToKick,
  initiateKickVote,
  voteToKick,
} from "shared/validations/kick"
import { SkyjoSocket } from "../types/skyjoSocket"

const instance = new KickService()

export const kickRouter = (socket: SkyjoSocket) => {
  socket.on("kick:initiate-vote", async (data: InitiateKickVote) => {
    try {
      const { targetId } = initiateKickVote.parse(data)
      await instance.onInitiateKickVote(socket, targetId)
    } catch (error) {
      Logger.error(`Error while initiating a kick vote`, {
        error,
      })
    }
  })

  socket.on("kick:vote", async (data: VoteToKick) => {
    try {
      const { vote } = voteToKick.parse(data)
      await instance.onVoteToKick(socket, vote)
    } catch (error) {
      Logger.error(`Error while voting to kick a player`, {
        error,
      })
    }
  })
}
