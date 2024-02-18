import { z } from "zod"
import { Avatar } from "../types/player"

const avatar: z.ZodType<Avatar> = z.enum([
  "bee",
  "crab",
  "dog",
  "elephant",
  "fox",
  "frog",
  "koala",
  "octopus",
  "penguin",
  "turtle",
  "whale",
])

export const createPlayer = z.object({
  username: z.string().min(1).max(100),
  avatar: avatar,
})

export type CreatePlayer = z.infer<typeof createPlayer>
