import { KickService } from "@/services/kick.service"
import { socketErrorHandlerWrapper } from "@/utils/socketErrorHandlerWrapper"
import {
  InitiateKickVote,
  VoteToKick,
  initiateKickVote,
  voteToKick,
} from "shared/validations/kick"
import { SkyjoSocket } from "../types/skyjoSocket"

const instance = new KickService()

export const kickRouter = (socket: SkyjoSocket) => {
  socket.on(
    "kick:initiate-vote",
    socketErrorHandlerWrapper(async (data: InitiateKickVote) => {
      const { targetId } = initiateKickVote.parse(data)
      await instance.onInitiateKickVote(socket, targetId)
    }),
  )

  socket.on(
    "kick:vote",
    socketErrorHandlerWrapper(async (data: VoteToKick) => {
      const { vote } = voteToKick.parse(data)
      await instance.onVoteToKick(socket, vote)
    }),
  )
}
