import { useSkyjo } from "@/contexts/SkyjoContext"
import { isCurrentUserTurn } from "@/lib/skyjo"
import { InfoIcon } from "lucide-react"
import { useTranslations } from "next-intl"

const GameInfo = () => {
  const { game, player } = useSkyjo()
  const t = useTranslations("components.GameInfo")

  const getGameInfo = () => {
    const t = useTranslations("utils.skyjo")
    if (!player || !game) return t("waiting")

    const playerWhoHasToPlay = game.players[game.turn]
    const roundInProgress =
      game.roundState === "playing" || game.roundState === "lastLap"

    if (game.status === "lobby") {
      return t("waiting")
    }

    if (
      game.status === "playing" &&
      game.roundState === "waitingPlayersToTurnTwoCards"
    ) {
      //TODO use game parameters to get the number of cards to turn
      return t("turn-cards", { number: 2 })
    }

    if (game.status === "playing" && roundInProgress) {
      return isCurrentUserTurn(game, player.socketId)
        ? t(`turn.${game.turnState}`)
        : t("player-turn", {
            playerName: playerWhoHasToPlay.name,
          })
    }

    if (game.status === "stopped") {
      return t("game-stopped")
    }

    if (game.roundState === "over" && game.status !== "finished") {
      return t("round-over")
    }

    if (game.status === "finished") {
      return t("game-ended")
    }
  }

  return (
    <div className="flex flex-row items-center gap-2 p-2 bg-off-white border-2 border-black rounded max-w-[300px] select-none">
      <InfoIcon size={20} />
      <div className="flex flex-col justify-start">
        {game.roundState === "lastLap" && (
          <p className="font-bold">{t("last-turn")}</p>
        )}
        <p>{getGameInfo()}</p>
      </div>
    </div>
  )
}

export default GameInfo
