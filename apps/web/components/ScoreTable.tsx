import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { SkyjoPlayerToJson } from "shared/types/skyjoPlayer"

type Props = {
  players: SkyjoPlayerToJson[]
  winner?: SkyjoPlayerToJson
}

const ScoreTable = ({ players, winner }: Props) => {
  const nbRounds = players[0].scores.length

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12"></TableHead>
          {Array.from({ length: nbRounds }).map((_, index) => (
            <TableHead key={index} className="text-center w-fit text-nowrap">
              Round {index + 1}
            </TableHead>
          ))}
          <TableHead className="text-center">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {players.map((player, index) => (
          <TableRow key={player.socketId}>
            <TableCell className="text-center w-32">
              {player.name} {winner?.socketId === player.socketId && "🏆"}
            </TableCell>
            {player.scores.map((score) => (
              <TableCell key={player.socketId + score} className="text-center">
                {score}
              </TableCell>
            ))}
            <TableCell className="text-center">
              {player.scores.reduce((a, b) => a + b, 0)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default ScoreTable
