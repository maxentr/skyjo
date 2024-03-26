import IndexPage from "@/app/[locale]/IndexPage"
import LanguageSettings from "@/components/LanguageSettings"
import RulesDialog from "@/components/RulesDialog"
import { useTranslations } from "next-intl"
import Image from "next/image"
import Link from "next/link"

type IndexServerPageProps = {
  searchParams: {
    gameId?: string
  }
  params: {
    locale: string
  }
}
const IndexServerPage = ({ searchParams, params }: IndexServerPageProps) => {
  const t = useTranslations("pages.Index")

  return (
    <div className="h-full flex flex-col">
      <div className="w-full grid grid-cols-3 grid-flow-row h-1/6">
        <div></div>
        <div></div>
        <div className="flex flex-row justify-end">
          <div className="w-10 flex flex-col gap-4">
            <LanguageSettings locale={params.locale} />
            <RulesDialog />
          </div>
        </div>
      </div>
      <div className="w-full grid grid-cols-1 grid-flow-row h-4/6">
        <div className="h-full flex items-center justify-center">
          <div className="bg-off-white border-2 border-black px-16 py-12 rounded-xl md:w-3/6 max-w-2xl flex flex-col items-center">
            <h1 className="mb-5">
              <Image
                src="/svg/logo.svg"
                width={0}
                height={0}
                style={{ width: "auto", height: "2.5rem" }}
                priority
                loading="eager"
                title="Skyjo"
                alt="Skyjo"
              />
            </h1>
            <IndexPage gameId={searchParams.gameId} />
          </div>
        </div>
      </div>
      <div className="w-full grid grid-cols-3 grid-flow-row h-1/6">
        <div></div>
        <div className="flex flex-col justify-end items-center">
          <Link href="https://github.com/Maxentr" target="_blank">
            <Image
              src="/svg/github.svg"
              width={24}
              height={24}
              alt="github.com/Maxentr"
            />
          </Link>
        </div>
        <div className="flex flex-col justify-end items-end">
          <Link
            href="https://www.magilano.com/produkt/skyjo/?lang=en&v=1d2a83b3af1f"
            target="_blank"
            className="text-slate-900 underline"
          >
            {t("buy-game")}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default IndexServerPage
