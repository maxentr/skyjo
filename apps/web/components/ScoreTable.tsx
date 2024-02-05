import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { SkyjoPlayerToJSON } from "shared/types/SkyjoPlayer"

type Props = {
  players: SkyjoPlayerToJSON[]
  winner?: SkyjoPlayerToJSON
}

const ScoreTable = ({ players, winner }: Props) => {
  const scoreRows = players[0]?.scores?.length
  const formattedScores = Array.from({ length: scoreRows }, (_, i) =>
    players.map((row) => row.scores[i] ?? 0),
  )

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableCell className="w-12"></TableCell>
          {players.map((player) => (
            <TableHead key={player.name} className="text-center">
              {player.name} {winner?.socketID === player.socketID && "🏆"}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {formattedScores.map((rows, index) => (
          <TableRow key={rows[0] + index}>
            <TableCell className="text-center w-32">
              Round {index + 1}
            </TableCell>
            {rows.map((score) => (
              <TableCell key={score + rows[0] + index} className="text-center">
                {score}
              </TableCell>
            ))}
          </TableRow>
        ))}
        <TableRow>
          <TableCell className="w-12 font-semibold text-center">
            Total
          </TableCell>
          {players.map((player) => (
            <TableCell key={player.socketID} className="text-center">
              {player.scores.reduce((a, b) => a + b, 0)}
            </TableCell>
          ))}
        </TableRow>
      </TableBody>
    </Table>
  )
}

export default ScoreTable
