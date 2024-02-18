import { z } from "zod"

export const playGeneral = z.object({
  gameId: z.string(),
})

export const playGeneralWithCardIndex = playGeneral.extend({
  column: z.number().int().min(0).max(3),
  row: z.number().int().min(0).max(2),
})

export const playRevealCard = playGeneralWithCardIndex
export type PlayRevealCard = z.infer<typeof playRevealCard>

export const playPickCard = playGeneral.extend({
  pile: z.enum(["draw", "discard"]),
})
export type PlayPickCard = z.infer<typeof playPickCard>

export const playReplaceCard = playGeneralWithCardIndex
export type PlayReplaceCard = z.infer<typeof playReplaceCard>

export const playDiscardSelectedCard = playGeneral
export type PlayDiscardSelectedCard = z.infer<typeof playDiscardSelectedCard>

export const playTurnCard = playGeneralWithCardIndex
export type PlayTurnCard = z.infer<typeof playTurnCard>
