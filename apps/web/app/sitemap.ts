import { locales } from "@/i18n"
import { DEFAULT_LOCALE } from "@/navigation"
import { MetadataRoute } from "next"

type Page = {
  name: string
  priority: number
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ""
  const pages: Page[] = [
    {
      name: "",
      priority: 1,
    },
    {
      name: "rules",
      priority: 0.8,
    },
    {
      name: "privacy-policy",
      priority: 0.7,
    },
  ]

  const sitemap = pages.map((page) => {
    return locales.map((locale) => {
      let url: string = ""
      if (locale === DEFAULT_LOCALE) {
        url = `${baseUrl}/${page.name}`
      } else if (page.name === "") {
        url = `${baseUrl}/${locale}`
      } else {
        url = `${baseUrl}/${locale}/${page.name}`
      }

      return {
        url,
        lastModified: new Date(),
        priority: page.priority,
      }
    })
  })

  return sitemap.flat()
}
