-- AlterEnum
ALTER TYPE "ReturnCondition" ADD VALUE 'RUSAK_SEDANG';

-- AlterTable
ALTER TABLE "equipment" ADD COLUMN     "harga_alat" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "returns" ADD COLUMN     "denda_kerusakan" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "persentase_kerusakan" DECIMAL(5,2);
