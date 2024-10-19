import { Card } from "@/components/Card"
import { useTranslations } from "next-intl"

const Rules = () => {
  const t = useTranslations("components.Rules")

  return (
    <div className="flex flex-col gap-6 text-black px-6">
      <div className="bg-slate-100 rounded-md pt-2 pb-4">
        <h3 className="md:pl-2 text-lg">
          {t("cards-section-title", { number: 150 })}
        </h3>
        <div className="mt-2 flex flex-col gap-2">
          <div className="flex flex-row gap-2 items-center">
            <p className="w-8 text-end">5x</p>
            <Card
              card={{
                id: "tutorial-2",
                value: -2,
                isVisible: true,
              }}
              size="tiny"
              className="w-8"
              flipAnimation={false}
              disabled
            />
          </div>
          <div className="flex flex-row gap-2 items-center">
            <p className="w-8 text-end">15x</p>
            <Card
              card={{
                id: "tutorial-0",
                value: 0,
                isVisible: true,
              }}
              size="tiny"
              className="w-8"
              flipAnimation={false}
              disabled
            />
          </div>
          <div className="flex flex-row gap-2 items-center">
            <p className="w-8 text-end flex-shrink-0">10x</p>
            <div className="flex flex-row items-center flex-wrap gap-1">
              {[-1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((value) => (
                <Card
                  key={value}
                  card={{
                    id: `tutorial-${value}}`,
                    value: value,
                    isVisible: true,
                  }}
                  size="tiny"
                  className="w-8"
                  flipAnimation={false}
                  disabled
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div>
        <h3 className="text-xl font-medium mb-0.5">{t("game-goal.title")}</h3>
        <p className="text-justify">{t("game-goal.content")}</p>
      </div>
      <div>
        <h3 className="text-xl font-medium mb-0.5">
          {t("round-preparation.title")}
        </h3>
        <p className="text-justify">{t("round-preparation.content-1")}</p>
        <p className="text-justify">{t("round-preparation.content-2")}</p>
      </div>
      <div>
        <h3 className="text-xl font-medium mb-0.5">{t("round-start.title")}</h3>
        <p className="text-justify">
          {t("round-start.content-1")}{" "}
          <span className="font-semibold text-blue-600">
            ({t("round-start.choice", { number: 1 })})
          </span>{" "}
          {t("round-start.content-2")}{" "}
          <span className="font-semibold text-blue-600">
            ({t("round-start.choice", { number: 2 })})
          </span>
          .
        </p>
        <p id="choice1" className="mt-1 text-justify">
          <span className="text-blue-600">
            <span className="font-semibold">
              {t("round-start.choice-1.title")}
            </span>{" "}
            {t("round-start.choice-1.description")}
          </span>{" "}
          {t("round-start.choice-1.content")}
        </p>
        <p className="mt-1 text-justify">
          <span className="text-blue-600">
            <span className="font-semibold">
              {t("round-start.choice-2.title")}
            </span>{" "}
            {t("round-start.choice-2.description")}
          </span>{" "}
          {t("round-start.choice-2.content-1")}{" "}
          <a href="#choice1" className="underline underline-offset-2">
            {t("round-start.choice-2.choice-1")}
          </a>
          . {t("round-start.choice-2.content-2")}
        </p>
        <p className="text-justify">{t("round-start.end-of-turn")}</p>
        <div className="flex flex-col gap-1 bg-blue-50 rounded-md py-2 px-4 mt-3">
          <p className="text-justify text-blue-700">
            <span className="font-semibold">{t("special-rule.title")}</span>{" "}
            {t("special-rule.content")}
          </p>
        </div>
      </div>
      <div>
        <h3 className="text-xl font-medium mb-0.5">{t("round-end.title")}</h3>
        <p className="text-justify">{t("round-end.content-1")}</p>
        <p className="text-justify">{t("round-end.content-2")}</p>
      </div>
      <div>
        <h3 className="text-xl font-medium mb-0.5">{t("scoring.title")}</h3>
        <p className="text-justify">{t("scoring.description")}</p>
        <ul className="marker:text-black list-disc list-inside">
          <li className="text-justify">{t("scoring.list.content-1")}</li>
          <li className="text-justify">{t("scoring.list.content-2")}</li>
        </ul>
        <p className="text-justify">{t("scoring.first-to-finish.content")}</p>
        <div className="flex flex-col gap-1 bg-amber-50 rounded-md py-2 px-4 mt-2">
          <p className="text-amber-700 text-justify">
            <span className="font-semibold">
              {t("scoring.first-to-finish.note.title")}
            </span>{" "}
            {t("scoring.first-to-finish.note.content")}
          </p>
        </div>
        <p className="text-justify mt-2">
          <span className="font-semibold">{t("scoring.example.title")}</span>{" "}
          {t("scoring.example.content")}
        </p>
      </div>
      <div>
        <h3 className="text-xl font-medium mb-0.5">{t("end-of-game.title")}</h3>
        <p className="text-justify">{t("end-of-game.content")}</p>
      </div>
    </div>
  )
}

export default Rules
