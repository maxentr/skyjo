import { DEFAULT_LOCALE } from "@/navigation"
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

export const getCurrentUrl = (route: string, locale?: string) => {
  const baseUrl = process.env.SITE_URL ?? ""
  const url =
    locale && locale !== DEFAULT_LOCALE
      ? `${baseUrl}/${locale}/${route}`
      : `${baseUrl}/${route}`

  return url
}
