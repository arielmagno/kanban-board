-- AddColumn: isPublic to Board (default true so all existing boards become public)
ALTER TABLE "Board" ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT true;

-- Index for filtering by visibility
CREATE INDEX "Board_isPublic_idx" ON "Board"("isPublic");
