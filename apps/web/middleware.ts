import { locales } from "@/i18n"
import createMiddleware from "next-intl/middleware"
import { localePrefix } from "./navigation"
export default createMiddleware({
  locales,
  localePrefix,
  defaultLocale: "en",
  localeDetection: true,
})

export const config = {
  matcher: ["/", "/(fr|en)/:path*"],
}
