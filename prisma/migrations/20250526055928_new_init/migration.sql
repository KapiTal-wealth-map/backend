-- CreateEnum
CREATE TYPE "SavedViewScope" AS ENUM ('private', 'shared', 'company');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "mfaSecret" TEXT,
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'invited',
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "notificationPreferences" JSONB NOT NULL DEFAULT '{"email": true, "inApp": true}',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dataAccessSettings" JSONB DEFAULT '{"restrictSensitiveData": true, "allowEmployeeDataExport": false, "allowPublicProfileViewing": false, "allowEmployeePropertySearch": true}',
    "logo" TEXT,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invite" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'pending',

    CONSTRAINT "Invite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'CA',
    "zip" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estimatedValue" DOUBLE PRECISION,
    "baths" DOUBLE PRECISION,
    "beds" INTEGER,
    "county" TEXT,
    "density" INTEGER,
    "medianIncome" INTEGER,
    "population" INTEGER,
    "sizeSqFt" INTEGER,
    "price" DOUBLE PRECISION,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FavoriteListing" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "favoritedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property_1" (
    "Zip Code" BIGINT NOT NULL,
    "Price" BIGINT NOT NULL,
    "Beds" BIGINT,
    "Baths" BIGINT,
    "Living Space" BIGINT,
    "Address" TEXT NOT NULL,
    "Zip Code Population" BIGINT,
    "Zip Code Density" DOUBLE PRECISION,
    "County" TEXT,
    "Median Household Income" BIGINT,
    "Latitude" DOUBLE PRECISION,
    "Longitude" DOUBLE PRECISION,
    "SizeRank" BIGINT,
    "RegionName" TEXT,
    "ZHVI" JSONB,
    "Market_Value" JSONB,
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "ownerId" TEXT,

    CONSTRAINT "Property_1_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Owner" (
    "name" TEXT,
    "netWorth" BIGINT,
    "occupation" TEXT,
    "age" INTEGER,
    "email" TEXT,
    "phone" TEXT,
    "purchaseDate" TIMESTAMP(6),
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),

    CONSTRAINT "Owner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedMapView" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "centerLat" DOUBLE PRECISION NOT NULL,
    "centerLng" DOUBLE PRECISION NOT NULL,
    "zoom" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "filters" JSONB,
    "showProperties" BOOLEAN,
    "showHeatmap" BOOLEAN,
    "showClusters" BOOLEAN,
    "scope" "SavedViewScope" NOT NULL DEFAULT 'private',
    "userId" TEXT NOT NULL,

    CONSTRAINT "SavedMapView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedViewShare" (
    "id" TEXT NOT NULL,
    "savedMapViewId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "SavedViewShare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Invite_token_key" ON "Invite"("token");

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteListing_userId_propertyId_key" ON "FavoriteListing"("userId", "propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "Property_1_Address_key" ON "Property_1"("Address");

-- CreateIndex
CREATE UNIQUE INDEX "SavedViewShare_savedMapViewId_userId_key" ON "SavedViewShare"("savedMapViewId", "userId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteListing" ADD CONSTRAINT "FavoriteListing_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property_1"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "FavoriteListing" ADD CONSTRAINT "FavoriteListing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property_1" ADD CONSTRAINT "Property_1_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedMapView" ADD CONSTRAINT "SavedMapView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedViewShare" ADD CONSTRAINT "SavedViewShare_savedMapViewId_fkey" FOREIGN KEY ("savedMapViewId") REFERENCES "SavedMapView"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedViewShare" ADD CONSTRAINT "SavedViewShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
