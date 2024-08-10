CREATE TYPE regions AS ENUM ('LOCAL', 'FR', 'US');

ALTER TABLE
  "games"
ADD
  COLUMN "regions" "regions" NOT NULL;