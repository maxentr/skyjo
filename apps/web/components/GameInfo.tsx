import { useSkyjo } from "@/contexts/SkyjoContext"
import { isCurrentUserTurn } from "@/lib/skyjo"
import { InfoIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { GAME_STATUS, ROUND_STATUS } from "shared/constants"

const GameInfo = () => {
  const { game, player } = useSkyjo()
  const t = useTranslations("components.GameInfo")

  const getGameInfo = () => {
    const t = useTranslations("utils.skyjo")
    if (!player || !game) return t("waiting")

    const playerWhoHasToPlay = game.players[game.turn]
    const roundInProgress =
      game.roundStatus === ROUND_STATUS.PLAYING ||
      game.roundStatus === ROUND_STATUS.LAST_LAP

    if (game.status === GAME_STATUS.LOBBY) {
      return t("waiting")
    }

    if (
      game.status === GAME_STATUS.PLAYING &&
      game.roundStatus === ROUND_STATUS.WAITING_PLAYERS_TO_TURN_INITIAL_CARDS
    ) {
      return t("turn-cards", { number: game.settings.initialTurnedCount })
    }

    if (game.status === GAME_STATUS.PLAYING && roundInProgress) {
      return isCurrentUserTurn(game, player.socketId)
        ? t(`turn.${game.turnStatus}`)
        : t("player-turn", {
            playerName: playerWhoHasToPlay.name,
          })
    }

    if (game.status === GAME_STATUS.STOPPED) {
      return t("game-stopped")
    }

    if (
      game.roundStatus === ROUND_STATUS.OVER &&
      game.status !== GAME_STATUS.FINISHED
    ) {
      return t("round-over")
    }

    if (game.status === GAME_STATUS.FINISHED) {
      return t("game-ended")
    }
  }

  return (
    <div className="hidden md:flex flex-row items-center gap-2 p-2 bg-container border-2 border-black rounded max-w-[300px] select-none">
      <InfoIcon size={20} />
      <div className="flex flex-col justify-start">
        {game.roundStatus === ROUND_STATUS.LAST_LAP && (
          <p className="font-bold">{t("last-turn")}</p>
        )}
        <p>{getGameInfo()}</p>
      </div>
    </div>
  )
}

export default GameInfo
