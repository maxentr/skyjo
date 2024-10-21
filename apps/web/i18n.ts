import deepmerge from "deepmerge"
import { getRequestConfig } from "next-intl/server"
import { notFound } from "next/navigation"

// Can be imported from a shared config
export const locales = ["en", "es", "fr"] as const
export type Locales = (typeof locales)[number]

export default getRequestConfig(async ({ locale }) => {
  const localesArray = [...locales] as string[]

  if (!localesArray.includes(locale)) notFound()

  const userMessages = (await import(`./locales/${locale}.json`)).default
  const defaultMessages = (await import(`./locales/en.json`)).default
  const messages = deepmerge(defaultMessages, userMessages)

  return { messages }
})
