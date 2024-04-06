import Rules from "@/components/Rules"
import { useTranslations } from "next-intl"
import Link from "next/link"

const RulesPage = () => {
  const t = useTranslations("pages.Rules")
  return (
    <div className="container bg-background my-16">
      <Link href="/" className="underline">{t("back")}</Link>
      <h1 className="text-3xl mt-6 mb-4">{t("title")}</h1>
      <Rules />
    </div>
  )
}

export default RulesPage
