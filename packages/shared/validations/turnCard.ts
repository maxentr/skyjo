import { z } from "zod"

export const turnCard = z.object({
  gameId: z.string(),
  playerId: z.string(),
  cardColumnIndex: z.number().int().min(0).max(3),
  cardRowIndex: z.number().int().min(0).max(2),
})

export type TurnCard = z.infer<typeof turnCard>
