-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "baths" DOUBLE PRECISION,
ADD COLUMN     "beds" INTEGER,
ADD COLUMN     "county" TEXT,
ADD COLUMN     "density" INTEGER,
ADD COLUMN     "medianIncome" INTEGER,
ADD COLUMN     "population" INTEGER,
ADD COLUMN     "sizeSqFt" INTEGER;
