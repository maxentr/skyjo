import "@/app/globals.css"
import Providers from "@/app/providers"
import { Inter } from "next/font/google"
import { PropsWithChildren } from "react"

const inter = Inter({
  subsets: ["latin-ext"],
  weight: "variable",
  display: "swap",
})

export default function RootLayout({ children }: Readonly<PropsWithChildren>) {
  return (
    <html lang="fr" suppressHydrationWarning className={inter.className}>
      <head>
        <title>Skyjo - Play Online with Friends</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <meta charSet="utf-8" />
        <meta
          name="description"
          content="Play Skyjo online with friends for free!"
        />
        <meta
          name="keywords"
          content="Skyjo, online, game, multPlayerInterface, free, play with friends"
        />
        <meta name="author" content="Maxent" />

        <meta property="og:title" content="Skyjo - Play Online with Friends" />
        <meta
          property="og:description"
          content="Play Skyjo online with friends for free!"
        />
        <meta property="og:url" content="https://skyjo-game.vercel.app/" />
        <meta property="og:type" content="website" />

        <link rel="icon" href="favicon.ico" type="image/x-icon" />
      </head>
      <body className="h-dvh bg-background antialiased overflow-hidden">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
