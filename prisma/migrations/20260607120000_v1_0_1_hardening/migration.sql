-- AlterTable
ALTER TABLE "User" ADD COLUMN "activeOrgId" TEXT;

-- AlterTable
ALTER TABLE "Field" ADD COLUMN "archivedAt" TIMESTAMP(3);

-- Backfill each user's active workspace from their earliest membership.
UPDATE "User" AS "user"
SET "activeOrgId" = "membership"."orgId"
FROM (
  SELECT DISTINCT ON ("userId") "userId", "orgId"
  FROM "OrgMember"
  ORDER BY "userId", "id"
) AS "membership"
WHERE "membership"."userId" = "user"."id";

-- CreateIndex
CREATE INDEX "User_activeOrgId_idx" ON "User"("activeOrgId");

-- CreateIndex
CREATE INDEX "Field_formId_archivedAt_order_idx" ON "Field"("formId", "archivedAt", "order");

-- AddForeignKey
ALTER TABLE "User"
ADD CONSTRAINT "User_activeOrgId_fkey"
FOREIGN KEY ("activeOrgId") REFERENCES "Org"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
