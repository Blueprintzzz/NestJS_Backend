-- Migration already applied to the database.
-- Using conditional DDL so the shadow database applies this cleanly.

ALTER TABLE "VehicleAvailability" ADD COLUMN IF NOT EXISTS "bookedByBookingId" TEXT;

ALTER TABLE "VehicleAvailability" DROP CONSTRAINT IF EXISTS "VehicleAvailability_bookedByBookingId_fkey";
ALTER TABLE "VehicleAvailability" ADD CONSTRAINT "VehicleAvailability_bookedByBookingId_fkey" FOREIGN KEY ("bookedByBookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "VehicleAvailability_bookedByBookingId_idx" ON "VehicleAvailability"("bookedByBookingId");
