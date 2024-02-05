import { z } from "zod"

export const playSkyjoGeneral = z.object({
  gameId: z.string(),
  playerId: z.string(),
})

export const playSkyjoGeneralWithCardIndex = z.object({
  gameId: z.string(),
  playerId: z.string(),
  cardColumnIndex: z.number().int().min(0).max(3),
  cardRowIndex: z.number().int().min(0).max(2),
})

export const playSkyjoTakeCard = playSkyjoGeneral.extend({
  actionType: z.enum(["takeFromDrawPile", "takeFromDiscardPile"]),
})
export type PlaySkyjoTakeCard = z.infer<typeof playSkyjoTakeCard>

export const playSkyjoReplace = playSkyjoGeneralWithCardIndex.extend({
  actionType: z.literal("replace"),
})
export type PlaySkyjoReplace = z.infer<typeof playSkyjoReplace>

export const playSkyjoThrow = playSkyjoGeneral.extend({
  actionType: z.literal("throwSelectedCard"),
})
export type PlaySkyjoThrow = z.infer<typeof playSkyjoThrow>

export const playSkyjoTurnCard = playSkyjoGeneralWithCardIndex.extend({
  actionType: z.literal("turnACard"),
})
export type PlaySkyjoTurnCard = z.infer<typeof playSkyjoTurnCard>

export const playSkyjo = z.union([
  playSkyjoTakeCard,
  playSkyjoReplace,
  playSkyjoThrow,
  playSkyjoTurnCard,
])
export type PlaySkyjo = z.infer<typeof playSkyjo>
export type PlaySkyjoActionType = PlaySkyjo["actionType"]

export type PlaySkyjoActionTypeTakeFromPile = Extract<
  PlaySkyjoActionType,
  "takeFromDrawPile" | "takeFromDiscardPile"
>
