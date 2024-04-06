import { locales } from "@/i18n"
import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.SITE_URL ?? ""
  const disallow = locales.map((locale) => `/${locale}/game/`)

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: disallow,
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
