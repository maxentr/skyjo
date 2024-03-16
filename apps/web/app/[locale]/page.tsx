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
    <div className="flex h-dvh items-center justify-center bg-white">
      <div className="absolute top-6 right-4 w-10 flex flex-col gap-4 items-center justify-center">
        <LanguageSettings locale={params.locale} />
        <RulesDialog />
      </div>
      <div className="bg-slate-200 border border-slate-300 px-16 py-12 rounded-xl w-3/6 max-w-2xl flex flex-col items-center">
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
          {t("buy-game")}
        </Link>
      </div>
    </div>
  )
}

export default IndexServerPage
