import z from "zod"

export const sendChatMessage = z.object({
  username: z.string(),
  message: z.string(),
})

export type SendChatMessage = z.infer<typeof sendChatMessage>
