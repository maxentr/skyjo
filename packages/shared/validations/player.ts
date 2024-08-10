import { z } from "zod"
import { AVATARS, Avatar } from "../constants"

const avatar: z.ZodType<Avatar> = z.enum(
  Object.values<Avatar>(AVATARS) as [Avatar],
)

export const createPlayer = z.object({
  username: z.string().min(1).max(100),
  avatar: avatar,
})

export type CreatePlayer = z.infer<typeof createPlayer>
