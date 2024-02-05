import IndexPage from "@/app/IndexPage"
import { cn } from "@/lib/utils"
import { Shantell_Sans } from "next/font/google"

const shantell = Shantell_Sans({ subsets: ["latin"], weight: "700" })

type IndexServerPageProps = {
  searchParams: {
    gameId?: string
  }
}
const IndexServerPage = ({ searchParams }: IndexServerPageProps) => {
  return (
    <div className="flex h-dvh items-center justify-center bg-slate-200">
      <div className="bg-slate-300 border border-slate-600 px-16 py-12 rounded-xl w-3/6 max-w-2xl flex flex-col items-center">
        <h1
          className={cn(
            "text-4xl text-center mb-5 text-slate-900",
            shantell.className,
          )}
        >
          Skyjo
        </h1>
        <IndexPage gameId={searchParams.gameId} />
  return <IndexPage gameId={searchParams.gameId} />
      </div>
    </div>
  )
}

export default IndexServerPage
