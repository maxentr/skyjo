export type KickVote = {
  playerToKickId: string
  initiatorId: string
  votes: { playerId: string; vote: boolean }[]
  requiredVotes: number
  expiresAt: number
}
