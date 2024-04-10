import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useTranslations } from "next-intl"
import { SkyjoPlayerToJson } from "shared/types/skyjoPlayer"

type Props = {
  players: SkyjoPlayerToJson[]
  winner?: SkyjoPlayerToJson
}

const ScoreTable = ({ players, winner }: Props) => {
  const t = useTranslations("components.ScoreTable")

  const nbRounds = players[0].scores.length

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-full">{t("name")}</TableHead>
          {Array.from({ length: nbRounds }).map((_, index) => (
            <TableHead key={index} className="text-center w-fit text-nowrap">
              {t("round")} {index + 1}
            </TableHead>
          ))}
          <TableHead>{t("total")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {players.map((player) => (
          <TableRow key={player.socketId}>
            <TableCell>
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
            <TableCell>
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
