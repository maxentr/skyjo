import Rules from "@/components/Rules"
import { useTranslations } from "next-intl"
import Link from "next/link"

const RulesPage = () => {
  const t = useTranslations("pages.Rules")
  return (
    <div className="container bg-body dark:bg-dark-body my-16 text-black dark:text-dark-font">
      <Link href="/" className="underline">
        {t("back")}
      </Link>
      <h1 className="text-3xl mt-6 mb-4">{t("title")}</h1>
      <Rules />
    </div>
  )
}

export default RulesPage
