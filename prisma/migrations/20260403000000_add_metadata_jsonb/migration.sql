-- Add metadata JSONB column with a default (existing rows get the default value)
ALTER TABLE "Event" ADD COLUMN "metadata" JSONB NOT NULL DEFAULT '{"registration":{"capacity":null,"collectPhone":false,"collectNotes":false}}';

-- Backfill existing rows from the old columns before dropping them
UPDATE "Event"
SET "metadata" = jsonb_build_object(
  'registration', jsonb_build_object(
    'capacity',     "capacity",
    'collectPhone', "collectPhone",
    'collectNotes', "collectNotes"
  )
);

-- Drop the migrated columns
ALTER TABLE "Event" DROP COLUMN "capacity";
ALTER TABLE "Event" DROP COLUMN "collectPhone";
ALTER TABLE "Event" DROP COLUMN "collectNotes";
