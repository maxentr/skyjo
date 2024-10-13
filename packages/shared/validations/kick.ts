import { z } from "zod"

export const initiateKickVote = z.object({
  targetId: z.string().uuid(),
})
export type InitiateKickVote = z.infer<typeof initiateKickVote>

export const voteToKick = z.object({
  vote: z.boolean(),
})
export type VoteToKick = z.infer<typeof voteToKick>
