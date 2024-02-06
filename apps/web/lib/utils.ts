import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getGameInviteLink = (currentUrl: string) => {
  const indexOfLastSlash = currentUrl.lastIndexOf("/")
  const baseUrl = currentUrl.slice(0, indexOfLastSlash)
  const gameId = currentUrl.slice(indexOfLastSlash + 1)

  return `${baseUrl}/?gameId=${gameId}`
}
