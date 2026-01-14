-- AlterTable
ALTER TABLE "equipment" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
