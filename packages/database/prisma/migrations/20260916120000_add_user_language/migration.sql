-- Additive and nullable by design: existing application versions neither read
-- nor require this value, so this migration is safe to apply before the code
-- that consumes it. Keep the column when rolling back application code.
CREATE TYPE "AppLanguage" AS ENUM ('en', 'es');

ALTER TABLE "User" ADD COLUMN "language" "AppLanguage";
