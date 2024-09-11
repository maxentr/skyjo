import { DEFAULT_LOCALE } from "@/navigation"
import { type ClassValue, clsx } from "clsx"
import { GAME_STATUS, GameStatus } from "shared/constants"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getGameInviteLink = (gameCode: string) => {
  return `${process.env.NEXT_PUBLIC_SITE_URL}/?gameCode=${gameCode}`
}

export const getCurrentUrl = (route: string, locale?: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ""
  const url =
    locale && locale !== DEFAULT_LOCALE
      ? `${baseUrl}/${locale}/${route}`
      : `${baseUrl}/${route}`

  return url
}

export const getRedirectionUrl = (code: string, status: GameStatus) => {
  const redirectionUrls = {
    [GAME_STATUS.LOBBY]: `/game/${code}/lobby`,
    [GAME_STATUS.PLAYING]: `/game/${code}`,
    [GAME_STATUS.STOPPED]: `/game/${code}/results`,
    [GAME_STATUS.FINISHED]: `/game/${code}/results`,
  } as const

  return redirectionUrls[status]
}
