import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useTranslations } from "next-intl"
import { useEffect } from "react"
import { SkyjoPlayerToJson } from "shared/types/skyjoPlayer"

type Props = {
  players: SkyjoPlayerToJson[]
  winner?: SkyjoPlayerToJson
  scrollToEnd?: boolean
}

const ScoreTable = ({ players, winner, scrollToEnd = false }: Props) => {
  const t = useTranslations("components.ScoreTable")

  const nbRounds = players[0].scores.length

  useEffect(() => {
    if (!scrollToEnd) return

    const table = document.querySelector("#end-round-table")

    table?.scrollIntoView({
      block: "end",
      inline: "end",
    })
  }, [])

  return (
    <Table id="end-round-table">
      <TableHeader>
        <TableRow>
          <TableHead className="sticky left-0 w-full z-10">
            {t("name")}
          </TableHead>
          {Array.from({ length: nbRounds }).map((_, index) => (
            <TableHead key={index} className="text-center w-fit text-nowrap">
              {t("round")} {index + 1}
            </TableHead>
          ))}
          <TableHead className="sticky right-0 w-full z-10">
            {t("total")}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {players.map((player) => (
          <TableRow key={player.socketId}>
            <TableCell className="sticky left-0 z-10">
              {player.name} {winner?.socketId === player.socketId && "🏆"}
            </TableCell>
            {player.scores.map((score, scoreIndex) => (
              <TableCell
                key={player.socketId + scoreIndex}
                className="text-center w-fit"
              >
                {score}
              </TableCell>
            ))}
            <TableCell className="sticky right-0 z-10">
              {player.scores
                .filter((score) => Number.isInteger(score))
                .reduce((a, b) => +a + +b, 0)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default ScoreTable
