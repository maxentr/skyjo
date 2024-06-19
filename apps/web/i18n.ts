import { getRequestConfig } from "next-intl/server"
import { notFound } from "next/navigation"

// Can be imported from a shared config
export const locales = ["en", "fr"] as const
export type Locales = (typeof locales)[number]

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  // biome-ignore lint/suspicious/noExplicitAny: cannot type locale here
  if (!locales.includes(locale as any)) notFound()

  return {
    messages: (await import(`./locales/${locale}.json`)).default,
  }
})
