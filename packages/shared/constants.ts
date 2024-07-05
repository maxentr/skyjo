export const SKYJO_DEFAULT_SETTINGS = {
  MAX_PLAYERS: 8,
  ALLOW_SKYJO_FOR_COLUMN: true,
  ALLOW_SKYJO_FOR_ROW: false,
  SCORE_TO_END_GAME: 100,
  MULTIPLIER_FOR_FIRST_PLAYER: 2,
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

export const LOCAL_REGIONS = [
  {
    name: "Local",
    tag: "LOCAL",
    url: "http://localhost:3001",
  },
] as const

const PROD_REGIONS = [
  {
    name: "Europe",
    tag: "FR",
    url: "https://skyjo-online-eu.fly.dev",
  },
  {
    name: "America",
    tag: "US",
    url: "https://skyjo-online-us.fly.dev",
  },
] as const

export const API_REGIONS = {
  LOCAL: LOCAL_REGIONS,
  PROD: PROD_REGIONS,
}

export type ApiRegions = {
  name: string
  tag: string
  url: string
  ms?: number
}

export type ApiRegionsTag =
  (typeof API_REGIONS)[keyof typeof API_REGIONS][number]["tag"]
