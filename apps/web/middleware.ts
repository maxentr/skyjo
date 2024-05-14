import { locales } from "@/i18n"
import createMiddleware from "next-intl/middleware"
import { DEFAULT_LOCALE, localePrefix } from "./navigation"

export default createMiddleware({
  locales,
  localePrefix,
  defaultLocale: DEFAULT_LOCALE,
  localeDetection: false,
})

export const config = {
  matcher: ["/", "/(fr|en)/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"],
}
