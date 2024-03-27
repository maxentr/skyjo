import { Opponents } from "@/types/opponents"
import { useTranslations } from "next-intl"
import { SkyjoToJson } from "shared/types/skyjo"
import { SkyjoPlayerToJson } from "shared/types/skyjoPlayer"

export const getCurrentUser = (
  players: SkyjoToJson["players"] | undefined,
  username: string,
) => {
  if (!players) {
    return undefined
  }

  return players.find((player) => player.name === username)
}

export const getOpponents = (
  players: SkyjoToJson["players"] | undefined,
  username: string,
): Opponents => {
  if (!players) {
    return [[], [], []]
  }

  const playerIndex = players.findIndex((player) => player.name === username)

  const connectedPlayers = players.filter(
    (player) => player.connectionStatus !== "disconnected",
  )

  const connectedOpponents = [
    ...connectedPlayers.slice(playerIndex + 1),
    ...connectedPlayers.slice(0, playerIndex),
  ]

  // if 2 players then [[], [player, player], []]
  // if 3 players then [[player], [player], [player]]
  // if 4 players then [[player], [player, player], [player]]
  // if 5 players then [[player], [player, player, player], [player]]
  // if 6 players then [[player], [player, player, player, player], [player]]
  // if 7 players then [[player], [player, player, player, player, player], [player]]

  if (connectedOpponents.length <= 2) {
    return [[], connectedOpponents, []]
  } else {
    const firstOpponent = connectedOpponents.shift()!
    const lastOpponent = connectedOpponents.pop()!

    return [[firstOpponent], connectedOpponents, [lastOpponent]]
  }
}

export const isCurrentUserTurn = (game?: SkyjoToJson, username?: string) => {
  if (!username || !game) return false
  if (
    game.status !== "playing" ||
    game.roundState === "waitingPlayersToTurnTwoCards"
  )
    return false

  return game.players[game.turn].name === username
}

export const canTurnTwoCards = (game: SkyjoToJson) => {
  return (
    game.status === "playing" &&
    game.roundState === "waitingPlayersToTurnTwoCards"
  )
}

export const getWinner = (game: SkyjoToJson) => {
  return game.players.reduce((prev, current) =>
    prev.score < current.score ? prev : current,
  )
}

export const getGameInfo = (player?: SkyjoPlayerToJson, game?: SkyjoToJson) => {
  const t = useTranslations("utils.skyjo")
  if (!player || !game) return t("waiting")

  const playerWhoHasToPlay = game.players[game.turn]

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

  if (
    game.status === "playing" &&
    (game.roundState === "playing" || game.roundState === "lastLap")
  ) {
    return isCurrentUserTurn(game, player.name)
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
