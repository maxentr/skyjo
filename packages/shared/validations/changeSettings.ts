import { z } from "zod"
import { SKYJO_DEFAULT_SETTINGS } from "../constants"

export const changeSettings = z
  .object({
    private: z.boolean(),
    allowSkyjoForColumn: z.boolean(),
    allowSkyjoForRow: z.boolean(),
    initialTurnedCount: z.number().int().min(0),
    cardPerRow: z
      .number()
      .int()
      .min(1)
      .max(SKYJO_DEFAULT_SETTINGS.cards.PER_ROW),
    cardPerColumn: z
      .number()
      .int()
      .min(1)
      .max(SKYJO_DEFAULT_SETTINGS.cards.PER_COLUMN),
  })
  .refine(
    (data) => data.initialTurnedCount < data.cardPerColumn * data.cardPerRow,
    {
      message:
        "The initial number of cards must be less than the total of cards",
    },
  )

export type ChangeSettings = z.infer<typeof changeSettings>
