import {
  boolean,
  integer,
  json,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"
import {
  API_REGIONS_TAGS,
  AVATARS,
  ApiRegionsTag,
  Avatar,
  CONNECTION_STATUS,
  ConnectionStatus,
  GAME_STATUS,
  GameStatus,
  LAST_TURN_STATUS,
  LastTurnStatus,
  ROUND_STATUS,
  RoundStatus,
  SKYJO_DEFAULT_SETTINGS,
  TURN_STATUS,
  TurnStatus,
} from "shared/constants"
import { SkyjoCardDb } from "shared/types/skyjoCard"
import { SkyjoPlayerScores } from "shared/types/skyjoPlayer"

const gameStatusEnum = pgEnum(
  "game_status",
  Object.values(GAME_STATUS) as [string],
)

const roundStatusEnum = pgEnum(
  "round_status",
  Object.values(ROUND_STATUS) as [string],
)

const turnStatusEnum = pgEnum(
  "turn_status",
  Object.values(TURN_STATUS) as [string],
)

const lastTurnStatusEnum = pgEnum(
  "last_turn_status",
  Object.values(LAST_TURN_STATUS) as [string],
)

const avatarEnum = pgEnum("avatar", Object.values(AVATARS) as [string])

const connectionStatusEnum = pgEnum(
  "connection_status",
  Object.values(CONNECTION_STATUS) as [string],
)

const regionsEnum = pgEnum("regions", API_REGIONS_TAGS)

export const gameTable = pgTable("games", {
  id: uuid("id").primaryKey(),
  code: varchar("code", { length: 8 }).notNull().unique(),
  status: gameStatusEnum("status").$type<GameStatus>().notNull(),
  turn: integer("turn").notNull(),
  turnStatus: turnStatusEnum("turn_status").$type<TurnStatus>().notNull(),
  lastTurnStatus: lastTurnStatusEnum("last_turn_status")
    .$type<LastTurnStatus>()
    .notNull(),
  roundStatus: roundStatusEnum("round_status").$type<RoundStatus>().notNull(),
  roundNumber: integer("round_number").notNull(),
  discardPile: integer("discard_pile").array().notNull(),
  drawPile: integer("draw_pile").array().notNull(),
  selectedCardValue: integer("selected_card_value"),
  lastDiscardCardValue: integer("last_discard_card_value"),

  adminId: uuid("admin_id").notNull(),
  firstToFinishPlayerId: uuid("first_to_finish_player_id"),

  // settings
  allowSkyjoForColumn: boolean("allow_skyjo_for_column")
    .notNull()
    .default(SKYJO_DEFAULT_SETTINGS.ALLOW_SKYJO_FOR_COLUMN),
  allowSkyjoForRow: boolean("allow_skyjo_for_row")
    .notNull()
    .default(SKYJO_DEFAULT_SETTINGS.ALLOW_SKYJO_FOR_ROW),
  initialTurnedCount: integer("initial_turned_count")
    .notNull()
    .default(SKYJO_DEFAULT_SETTINGS.CARDS.INITIAL_TURNED_COUNT),
  cardPerRow: integer("card_per_row")
    .notNull()
    .default(SKYJO_DEFAULT_SETTINGS.CARDS.PER_ROW),
  cardPerColumn: integer("card_per_column")
    .notNull()
    .default(SKYJO_DEFAULT_SETTINGS.CARDS.PER_COLUMN),
  scoreToEndGame: integer("score_to_end_game")
    .notNull()
    .default(SKYJO_DEFAULT_SETTINGS.SCORE_TO_END_GAME),
  multiplierForFirstPlayer: integer("multiplier_for_first_player")
    .notNull()
    .default(SKYJO_DEFAULT_SETTINGS.MULTIPLIER_FOR_FIRST_PLAYER),
  maxPlayers: integer("max_players")
    .notNull()
    .default(SKYJO_DEFAULT_SETTINGS.MAX_PLAYERS),
  isPrivate: boolean("is_private").notNull(),

  // computed
  isFull: boolean("is_full").notNull(),

  region: regionsEnum("regions").$type<ApiRegionsTag>().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const playerTable = pgTable("players", {
  id: uuid("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  socketId: varchar("socket_id", { length: 255 }).notNull(),
  avatar: avatarEnum("avatar").$type<Avatar>().notNull(),
  score: integer("score").notNull(),
  wantsReplay: boolean("wants_replay").notNull(),
  connectionStatus: connectionStatusEnum("connection_status")
    .$type<ConnectionStatus>()
    .notNull(),
  cards: json("cards").$type<SkyjoCardDb[][]>().notNull(),
  scores: json("scores").$type<SkyjoPlayerScores>().notNull(),
  disconnectionDate: timestamp("disconnection_date"),

  gameId: uuid("game_id")
    .references(() => gameTable.id, {
      onDelete: "cascade",
    })
    .notNull(),
})

export type DbGame = typeof gameTable.$inferSelect
export type DbPlayer = typeof playerTable.$inferSelect
