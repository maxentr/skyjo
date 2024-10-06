export type KickVote = {
  playerToKickId: string
  initiatorId: string
  votes: Map<string, boolean>
  requiredVotes: number
  expiresAt: number
}
