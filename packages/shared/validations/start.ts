import { z } from "zod"

export const startGame = z.object({
  gameId: z.string(),
})
export type StartGame = z.infer<typeof startGame>
