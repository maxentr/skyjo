import { locales } from "@/i18n"
import { DEFAULT_LOCALE } from "@/navigation"
import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ""
  const disallow = locales.map((locale) =>
    locale === DEFAULT_LOCALE ? `/game/` : `/${locale}/game/`,
  )

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: disallow,
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
