ALTER TABLE "Session"
ADD COLUMN IF NOT EXISTS "anonSessionId" TEXT;

CREATE INDEX IF NOT EXISTS "Session_anonSessionId_idx" ON "Session"("anonSessionId");
