import Providers from "@/app/[locale]/providers"
import { Metadata } from "next"
import { NextIntlClientProvider } from "next-intl"
import { getMessages, getTranslations } from "next-intl/server"
import { Fredoka } from "next/font/google"

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: "variable",
  display: "swap",
})

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const t = await getTranslations({ locale, namespace: "head" })

  const title = `Skyjo - ${t("title")}`
  const baseUrl = new URL("https://skyjo-game.vercel.app")
  const githubUrl = new URL("https://github.com/Maxentr")

  const metadata: Metadata = {
    title: title,
    description: t("description"),
    keywords: t("keywords").split(","),
    category: "game",
    metadataBase: baseUrl,
    alternates: {
      canonical: baseUrl,
      languages: {
        en: "/en",
        fr: "/fr",
      },
    },
    authors: { url: githubUrl, name: "Maxent" },
    openGraph: {
      title: title,
      description: t("description"),
      url: baseUrl,
      type: "website",
    },
    robots: {
      index: true,
      follow: true,
      nocache: true,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: "Kipk8U-mhfetdtSI7Cy8V4QKE1Cc1Ws97QpZ3QfVNVk",
    },
  }

  return metadata
}

export type LocaleLayoutProps = Readonly<{
  children: React.ReactNode
  params: { locale: string }
}>

export default async function LocaleLayout({
  children,
  params: { locale },
}: LocaleLayoutProps) {
  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning className={fredoka.className}>
      <body className="relative h-[calc(100dvh-48px)] !m-6 bg-background antialiased overflow-hidden">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
