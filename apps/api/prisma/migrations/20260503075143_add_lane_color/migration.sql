-- AlterTable
ALTER TABLE "Lane" ADD COLUMN     "color" TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "tenantId" DROP DEFAULT;
