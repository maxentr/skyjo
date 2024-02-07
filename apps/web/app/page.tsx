import IndexPage from "@/app/IndexPage"
import { cn } from "@/lib/utils"
import { Shantell_Sans } from "next/font/google"
import Image from "next/image"
import Link from "next/link"

const shantell = Shantell_Sans({ subsets: ["latin"], weight: "700" })

type IndexServerPageProps = {
  searchParams: {
    gameId?: string
  }
}
const IndexServerPage = ({ searchParams }: IndexServerPageProps) => {
  return (
    <div className="flex h-dvh items-center justify-center bg-white">
      <div className="bg-slate-200 border border-slate-300 px-16 py-12 rounded-xl w-3/6 max-w-2xl flex flex-col items-center">
        <h1
          className={cn(
            "text-4xl text-center mb-5 text-slate-900",
            shantell.className,
          )}
        >
          Skyjo
        </h1>
        <IndexPage gameId={searchParams.gameId} />
        <div className="absolute bottom-4 mx-auto flex flex-row justify-center items-center gap-4">
          <Link href="https://github.com/Maxentr" target="_blank">
            <Image
              src="/svg/github.svg"
              width={24}
              height={24}
              alt="github.com/Maxentr"
            />
          </Link>
        </div>
        <Link
          href="https://www.magilano.com/produkt/skyjo/?lang=en&v=1d2a83b3af1f"
          target="_blank"
          className="absolute bottom-4 right-4 text-slate-900 underline"
        >
          Acheter le jeu
        </Link>
      </div>
    </div>
  )
}

export default IndexServerPage
