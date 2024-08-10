CREATE TYPE game_status AS ENUM ('lobby', 'playing', 'finished', 'stopped');

CREATE TYPE round_status AS ENUM (
	'waitingPlayersToTurnInitialCards',
	'playing',
	'lastLap',
	'over'
);

CREATE TYPE turn_status AS ENUM (
	'chooseAPile',
	'throwOrReplace',
	'turnACard',
	'replaceACard'
);

CREATE TYPE last_turn_status AS ENUM (
	'pickFromDrawPile',
	'pickFromDiscardPile',
	'throw',
	'replace',
	'turn'
);

CREATE TYPE avatar AS ENUM (
	'bee',
	'crab',
	'dog',
	'elephant',
	'fox',
	'frog',
	'koala',
	'octopus',
	'penguin',
	'turtle',
	'whale'
);

CREATE TYPE connection_status AS ENUM ('connected', 'connection-lost', 'leave', 'disconnected');

CREATE TABLE IF NOT EXISTS "games" (
	"id" uuid PRIMARY KEY NOT NULL,
	"code" varchar(8) NOT NULL,
	"status" "game_status" NOT NULL,
	"turn" integer NOT NULL,
	"turn_status" "turn_status" NOT NULL,
	"last_turn_status" "last_turn_status" NOT NULL,
	"round_status" "round_status" NOT NULL,
	"round_number" integer NOT NULL,
	"discard_pile" integer[] NOT NULL,
	"draw_pile" integer[] NOT NULL,
	"selected_card_value" integer,
	"last_discard_card_value" integer,
	"admin_id" uuid,
	"first_to_finish_player_id" uuid,
	"allow_skyjo_for_column" boolean DEFAULT true NOT NULL,
	"allow_skyjo_for_row" boolean DEFAULT false NOT NULL,
	"initial_turned_count" integer DEFAULT 2 NOT NULL,
	"card_per_row" integer DEFAULT 3 NOT NULL,
	"card_per_column" integer DEFAULT 4 NOT NULL,
	"score_to_end_game" integer DEFAULT 100 NOT NULL,
	"multiplier_for_first_player" integer DEFAULT 2 NOT NULL,
	"max_players" integer DEFAULT 8 NOT NULL,
	"is_private" boolean NOT NULL,
	"is_full" boolean NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "games_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "players" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"socket_id" varchar(255) NOT NULL,
	"avatar" "avatar" NOT NULL,
	"score" integer NOT NULL,
	"want_replay" boolean NOT NULL,
	"connection_status" "connection_status" NOT NULL,
	"cards" json NOT NULL,
	"scores" json NOT NULL,
	"disconnection_date" timestamp,
	"game_id" uuid NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "players" ADD CONSTRAINT "players_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
