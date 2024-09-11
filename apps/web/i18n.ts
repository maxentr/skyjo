import { getRequestConfig } from "next-intl/server"
import { notFound } from "next/navigation"

// Can be imported from a shared config
export const locales = ["en", "fr"] as const
export type Locales = (typeof locales)[number]

export default getRequestConfig(async ({ locale }) => {
  const localesArray = [...locales] as string[]

  if (!localesArray.includes(locale)) notFound()

  return {
    messages: (await import(`./locales/${locale}.json`)).default,
  }
})
