import { SkyjoToJson, TurnState } from "shared/types/skyjo"
import { SkyjoPlayerToJson } from "shared/types/skyjoPlayer"

const TURN_STATE_MESSAGES: Record<TurnState, string> = {
  chooseAPile: "Choisissez une pile",
  throwOrReplace: "Remplacez une carte ou défaussez la carte piochée",
  replaceACard: "Sélectionnez une carte à remplacer",
  turnACard: "Sélectionnez une carte à retourner",
}
const WAITING_MESSAGE = "En attente de joueurs"
const TURN_TWO_CARDS_MESSAGE = "Retourner deux cartes"
const WAITING_TURN_MESSAGE = (username: string) =>
  `C'est au tour de ${username}`

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
): SkyjoToJson["players"] => {
  if (!players) {
    return []
  }

  return players.filter(
    (player) =>
      player.name !== username && player.connectionStatus !== "disconnected",
  )
}

export const isCurrentUserTurn = (game?: SkyjoToJson, username?: string) => {
  if (!username || !game) return false
  console.log(game, username)
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
  if (!player || !game) return WAITING_MESSAGE

  const playerWhoHasToPlay = game.players[game.turn]

  if (game.status === "lobby") {
    return WAITING_MESSAGE
  }

  if (
    game.status === "playing" &&
    game.roundState === "waitingPlayersToTurnTwoCards"
  ) {
    return TURN_TWO_CARDS_MESSAGE
  }

  if (
    game.status === "playing" &&
    (game.roundState === "playing" || game.roundState === "lastLap")
  ) {
    return isCurrentUserTurn(game, player.name)
      ? TURN_STATE_MESSAGES[game.turnState]
      : WAITING_TURN_MESSAGE(playerWhoHasToPlay.name)
  }

  if (game.roundState === "over" && game.status !== "finished") {
    return "Manche terminée"
  }

  if (game.status === "finished") {
    return "Partie terminée !"
  }

  if (game.status === "stopped") {
    return "Partie arrêtée"
  }
}
