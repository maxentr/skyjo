import Providers from "@/app/[locale]/providers"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
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
