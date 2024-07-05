import { DEFAULT_LOCALE } from "@/navigation"
import { type ClassValue, clsx } from "clsx"
import { API_REGIONS, ApiRegionsTag } from "shared/constants"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getGameInviteLink = (
  currentUrl: string,
  region: ApiRegionsTag | null,
) => {
  const thirdSlashIndex = currentUrl.indexOf("/", 10)
  const lastSlashIndex = currentUrl.lastIndexOf("/")
  const baseUrl = currentUrl.slice(0, thirdSlashIndex)
  const gameId = currentUrl.slice(lastSlashIndex + 1)

  let link = `${baseUrl}/?gameId=${gameId}`

  if (region) link = `${link}&region=${region}`

  return link
}

export const getCurrentUrl = (route: string, locale?: string) => {
  const baseUrl = process.env.SITE_URL ?? ""
  const url =
    locale && locale !== DEFAULT_LOCALE
      ? `${baseUrl}/${locale}/${route}`
      : `${baseUrl}/${route}`

  return url
}

export const getServerResponseTime = async (url: string) => {
  const start = new Date()
  try {
    const response = await fetch(url)

    if (response.status === 200) {
      const timeTakenInMs = new Date().getTime() - start.getTime()
      return timeTakenInMs
    } else {
      return -1
    }
  } catch {
    return -1
  }
}

export const getRegionsResponseTime = async () => {
  const regions = API_REGIONS[
    process.env.NEXT_PUBLIC_ENVIRONMENT as keyof typeof API_REGIONS
  ].map(async (region) => {
    const ms = await getServerResponseTime(region.url)
    return {
      ...region,
      ms,
    }
  })

  return Promise.all(regions)
}

export const getRegionWithLessPing = async () => {
  const servers = await getRegionsResponseTime()

  return servers.reduce((a, b) => {
    if (a.ms < b.ms) return a
    return b
  }, servers[0])
}

export const getCurrentRegion = (region: ApiRegionsTag | null) => {
  const currentRegion = API_REGIONS[
    process.env.NEXT_PUBLIC_ENVIRONMENT as keyof typeof API_REGIONS
  ].find((server) => server.tag === region)

  return currentRegion
}
