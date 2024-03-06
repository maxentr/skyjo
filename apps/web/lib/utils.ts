import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getGameInviteLink = (currentUrl: string) => {
  const thirdSlashIndex = currentUrl.indexOf("/", 10)
  const lastSlashIndex = currentUrl.lastIndexOf("/")
  const baseUrl = currentUrl.slice(0, thirdSlashIndex)
  const gameId = currentUrl.slice(lastSlashIndex + 1)

  return `${baseUrl}/?gameId=${gameId}`
}
