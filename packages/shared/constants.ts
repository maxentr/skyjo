//#region Skyjo
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

export const GAME_STATUS = {
  LOBBY: "lobby",
  PLAYING: "playing",
  FINISHED: "finished",
  STOPPED: "stopped",
} as const
export type GameStatus = (typeof GAME_STATUS)[keyof typeof GAME_STATUS]

export const ROUND_STATUS = {
  WAITING_PLAYERS_TO_TURN_INITIAL_CARDS: "waitingPlayersToTurnInitialCards",
  PLAYING: "playing",
  LAST_LAP: "lastLap",
  OVER: "over",
} as const
export type RoundStatus = (typeof ROUND_STATUS)[keyof typeof ROUND_STATUS]

export const TURN_STATUS = {
  CHOOSE_A_PILE: "chooseAPile",
  THROW_OR_REPLACE: "throwOrReplace",
  TURN_A_CARD: "turnACard",
  REPLACE_A_CARD: "replaceACard",
} as const
export type TurnStatus = (typeof TURN_STATUS)[keyof typeof TURN_STATUS]

export const LAST_TURN_STATUS = {
  PICK_FROM_DRAW_PILE: "pickFromDrawPile",
  PICK_FROM_DISCARD_PILE: "pickFromDiscardPile",
  THROW: "throw",
  REPLACE: "replace",
  TURN: "turn",
} as const
export type LastTurnStatus =
  (typeof LAST_TURN_STATUS)[keyof typeof LAST_TURN_STATUS]

export const AVATARS = {
  BEE: "bee",
  CRAB: "crab",
  DOG: "dog",
  ELEPHANT: "elephant",
  FOX: "fox",
  FROG: "frog",
  KOALA: "koala",
  OCTOPUS: "octopus",
  PENGUIN: "penguin",
  TURTLE: "turtle",
  WHALE: "whale",
} as const
export type Avatar = (typeof AVATARS)[keyof typeof AVATARS]

export const CONNECTION_STATUS = {
  CONNECTED: "connected",
  CONNECTION_LOST: "connection-lost",
  LEAVE: "leave",
  DISCONNECTED: "disconnected",
} as const
export type ConnectionStatus =
  (typeof CONNECTION_STATUS)[keyof typeof CONNECTION_STATUS]

export const USER_MESSAGE_TYPE = "message" as const
export type UserMessageType = typeof USER_MESSAGE_TYPE

export const SYSTEM_MESSAGE_TYPE = {
  SYSTEM_MESSAGE: "system-message",
  WARN_SYSTEM_MESSAGE: "warn-system-message",
  ERROR_SYSTEM_MESSAGE: "error-system-message",
} as const
export type SystemMessageType =
  (typeof SYSTEM_MESSAGE_TYPE)[keyof typeof SYSTEM_MESSAGE_TYPE]

export const SERVER_MESSAGE_TYPE = {
  PLAYER_JOINED: "player-joined",
  PLAYER_RECONNECT: "player-reconnect",
  PLAYER_LEFT: "player-left",
} as const

export const SERVER_MESSAGE_TYPE_ARRAY = Object.values(SERVER_MESSAGE_TYPE)

export type ServerMessageType =
  (typeof SERVER_MESSAGE_TYPE)[keyof typeof SERVER_MESSAGE_TYPE]

//#endregion Skyjo

export const ERROR = {
  GAME_NOT_FOUND: "game-not-found",
  PLAYER_NOT_FOUND: "player-not-found",
  NOT_ALLOWED: "not-allowed",
  INVALID_TURN_STATE: "invalid-turn-state",
  TOO_FEW_PLAYERS: "too-few-players",
  CANNOT_RECONNECT: "cannot-reconnect",
  GAME_IS_FULL: "game-is-full",
  GAME_ALREADY_STARTED: "game-already-started",
  KICK_VOTE_IN_PROGRESS: "kick-vote-in-progress",
  NO_KICK_VOTE_IN_PROGRESS: "no-kick-vote-in-progress",
} as const
export type Error = (typeof ERROR)[keyof typeof ERROR]
export const CONNECTION_LOST_TIMEOUT_IN_MS = 30000
export const LEAVE_TIMEOUT_IN_MS = 15000

//#region api regions

export const API_REGIONS_TAGS = ["LOCAL", "FR"] as const
export type ApiRegionsTag = (typeof API_REGIONS_TAGS)[number]

//#endregion api regions
