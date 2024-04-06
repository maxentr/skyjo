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

export type LocaleLayoutProps = Readonly<{
  children: React.ReactNode
  params: { locale: string }
}>

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const t = await getTranslations({ locale, namespace: "head" })

  const title = `Skyjo - ${t("title")}`
  const baseUrl = process.env.SITE_URL ?? ""
  const githubUrl = new URL("https://github.com/Maxentr")

  const metadata: Metadata = {
    title: title,
    description: t("description"),
    keywords: t("keywords").split(","),
    category: "game",
    icons: [
      { url: "/favicon.ico", rel: "shortcut icon" },
      {
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/browserconfig.xml", rel: "msapplication-config" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      {
        url: "/mstile-150x150.png",
        sizes: "150x150",
        type: "image/png",
        rel: "msapplication-TileImage",
      },
      { url: "/safari-pinned-tab.svg", color: "#5bbad5", rel: "mask-icon" },
      { url: "/site.webmanifest", rel: "manifest" },
    ],
    metadataBase: new URL(baseUrl),
    alternates: {
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
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      title,
      card: "summary_large_image",
      images: [
        {
          url: "/twitter-image.png",
          width: 1200,
          height: 675,
          alt: title,
        },
      ],
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

export default async function LocaleLayout({
  children,
  params: { locale },
}: LocaleLayoutProps) {
  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning className={fredoka.className}>
      <body className="bg-background antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
