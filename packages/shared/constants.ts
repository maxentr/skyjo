export const SKYJO_DEFAULT_SETTINGS = {
  MAX_PLAYERS: 8,
  ALLOW_SKYJO_FOR_COLUMN: true,
  ALLOW_SKYJO_FOR_ROW: false,
  SCORE_TO_END_GAME: 100,
  CARDS: {
    PER_ROW: 3,
    PER_COLUMN: 4,
    INITIAL_TURNED_COUNT: 2,
  },
} as const

export const ERROR = {
  GAME_NOT_FOUND: "game-not-found",
  PLAYER_NOT_FOUND: "player-not-found",
  NOT_ALLOWED: "not-allowed",
  INVALID_TURN_STATE: "invalid-turn-state",
  TOO_FEW_PLAYERS: "too-few-players",
} as const
