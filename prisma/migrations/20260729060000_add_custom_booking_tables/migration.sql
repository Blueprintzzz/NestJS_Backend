-- CreateEnum
CREATE TYPE "CustomBookingStatus" AS ENUM ('PENDING', 'OFFER_RECEIVED', 'ACCEPTED', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- CreateTable
CREATE TABLE "CustomBooking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "numberOfPeople" INTEGER NOT NULL,
    "budget" DECIMAL(10,2),
    "destinations" JSONB NOT NULL DEFAULT '[]',
    "requirements" TEXT,
    "status" "CustomBookingStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomBookingOffer" (
    "id" TEXT NOT NULL,
    "customBookingId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "description" TEXT NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "isAccepted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomBookingOffer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CustomBooking_userId_idx" ON "CustomBooking"("userId");

-- CreateIndex
CREATE INDEX "CustomBooking_status_idx" ON "CustomBooking"("status");

-- CreateIndex
CREATE INDEX "CustomBookingOffer_customBookingId_idx" ON "CustomBookingOffer"("customBookingId");

-- CreateIndex
CREATE INDEX "CustomBookingOffer_driverId_idx" ON "CustomBookingOffer"("driverId");

-- AddForeignKey
ALTER TABLE "CustomBookingOffer" ADD CONSTRAINT "CustomBookingOffer_customBookingId_fkey"
  FOREIGN KEY ("customBookingId") REFERENCES "CustomBooking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
