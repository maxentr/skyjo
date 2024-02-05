import "@/app/globals.css"
import { Inter } from "next/font/google"

import Providers from "@/app/providers"
import { PropsWithChildren } from "react"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
})

export default function RootLayout({ children }: Readonly<PropsWithChildren>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.className}>
      <head />
      <body className="h-dvh bg-background antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
