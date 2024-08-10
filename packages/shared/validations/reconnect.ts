import { z } from "zod"

export const reconnect = z.object({
  gameCode: z.string(),
  playerId: z.string(),
  maxDateToReconnect: z.string().date().optional(),
})

export type LastGame = z.infer<typeof reconnect>
