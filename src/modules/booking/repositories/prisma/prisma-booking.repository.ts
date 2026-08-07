import { Injectable } from '@nestjs/common';
import { BookingStatus, PaymentStatus, PaymentTransactionStatus } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { BookingQueryDto } from '../../dto/booking-query.dto';
import { CreateBookingDto } from '../../dto/create-booking.dto';
import { CreateBookingPassengerDto } from '../../dto/create-booking-passenger.dto';
import { Pagination } from '../../dto/booking-response.dto';
import { RecordPaymentDto } from '../../dto/record-payment.dto';
import { UpdateBookingDto } from '../../dto/update-booking.dto';
import { BookingEntity } from '../../entities/booking.entity';
import { BookingPassengerEntity } from '../../entities/booking-passenger.entity';
import { BookingPaymentEntity } from '../../entities/booking-payment.entity';
import { IBookingRepository } from '../interfaces/booking.repository.interface';

function generateBookingNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `BK-${date}-${rand}`;
}

function toNumber(val: any): number {
  return typeof val === 'object' && val !== null ? parseFloat(val.toString()) : Number(val);
}

@Injectable()
export class PrismaBookingRepository implements IBookingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBookingDto, userId: string, totalCost: number): Promise<BookingEntity> {
    const advance = dto.advancePayment ?? 0;
    const remaining = totalCost - advance;
    const paymentStatus: PaymentStatus =
      remaining <= 0 ? PaymentStatus.PAID : advance > 0 ? PaymentStatus.PARTIAL : PaymentStatus.NOT_PAID;

    const booking = await this.prisma.booking.create({
      data: {
        bookingNumber: generateBookingNumber(),
        userId,
        tourPackageId: dto.tourPackageId,
        vehicleId: dto.vehicleId,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        numberOfPassengers: dto.numberOfPassengers,
        totalCost,
        advancePayment: advance,
        remainingAmount: remaining < 0 ? 0 : remaining,
        paymentStatus,
        specialRequests: dto.specialRequests,
        passengers: {
          create: dto.passengers.map((p) => ({
            passengerName: p.passengerName,
            email: p.email,
            phone: p.phone,
            dateOfBirth: new Date(p.dateOfBirth),
            passportNumber: p.passportNumber,
          })),
        },
      },
      include: { passengers: true, payments: true },
    });

    return this.mapBooking(booking);
  }

  async findById(id: string): Promise<BookingEntity | null> {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { passengers: true, payments: true },
    });
    return booking ? this.mapBooking(booking) : null;
  }

  async findByBookingNumber(bookingNumber: string): Promise<BookingEntity | null> {
    const booking = await this.prisma.booking.findUnique({
      where: { bookingNumber },
      include: { passengers: true, payments: true },
    });
    return booking ? this.mapBooking(booking) : null;
  }

  async findByUserId(userId: string, query: BookingQueryDto): Promise<Pagination<BookingEntity>> {
    return this.paginate({ userId, ...this.buildWhere(query) }, query);
  }

  async findAll(query: BookingQueryDto): Promise<Pagination<BookingEntity>> {
    return this.paginate(this.buildWhere(query), query);
  }

  async update(id: string, dto: UpdateBookingDto): Promise<BookingEntity> {
    const data: any = {};
    if (dto.vehicleId !== undefined) data.vehicleId = dto.vehicleId;
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.endDate) data.endDate = new Date(dto.endDate);
    if (dto.numberOfPassengers) data.numberOfPassengers = dto.numberOfPassengers;
    if (dto.specialRequests !== undefined) data.specialRequests = dto.specialRequests;
    if (dto.advancePayment !== undefined) {
      const booking = await this.prisma.booking.findUnique({ where: { id } });
      const total = toNumber(booking!.totalCost);
      const advance = dto.advancePayment;
      const remaining = total - advance;
      data.advancePayment = advance;
      data.remainingAmount = remaining < 0 ? 0 : remaining;
      data.paymentStatus =
        remaining <= 0 ? PaymentStatus.PAID : advance > 0 ? PaymentStatus.PARTIAL : PaymentStatus.NOT_PAID;
    }

    const booking = await this.prisma.booking.update({
      where: { id },
      data,
      include: { passengers: true, payments: true },
    });
    return this.mapBooking(booking);
  }

  async cancel(id: string): Promise<BookingEntity> {
    const booking = await this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CANCELLED },
      include: { passengers: true, payments: true },
    });
    return this.mapBooking(booking);
  }

  async delete(id: string): Promise<boolean> {
    await this.prisma.booking.delete({ where: { id } });
    return true;
  }

  async addPassenger(bookingId: string, dto: CreateBookingPassengerDto): Promise<BookingPassengerEntity> {
    return this.prisma.bookingPassenger.create({
      data: {
        bookingId,
        passengerName: dto.passengerName,
        email: dto.email,
        phone: dto.phone,
        dateOfBirth: new Date(dto.dateOfBirth),
        passportNumber: dto.passportNumber,
      },
    });
  }

  async removePassenger(passengerId: string): Promise<boolean> {
    await this.prisma.bookingPassenger.delete({ where: { id: passengerId } });
    return true;
  }

  async recordPayment(bookingId: string, dto: RecordPaymentDto): Promise<BookingPaymentEntity> {
    const payment = await this.prisma.$transaction(async (tx) => {
      const p = await tx.bookingPayment.create({
        data: {
          bookingId,
          amount: dto.amount,
          paymentMethod: dto.paymentMethod,
          paymentDate: new Date(dto.paymentDate),
          transactionId: dto.transactionId,
          status: PaymentTransactionStatus.SUCCESS,
        },
      });

      const booking = await tx.booking.findUnique({ where: { id: bookingId } });
      const totalPaid = toNumber(booking!.totalCost) - toNumber(booking!.remainingAmount) + dto.amount;
      const remaining = toNumber(booking!.totalCost) - totalPaid;
      const paymentStatus: PaymentStatus =
        remaining <= 0 ? PaymentStatus.PAID : PaymentStatus.PARTIAL;
      const bookingStatus =
        remaining <= 0 ? BookingStatus.CONFIRMED : booking!.status;

      await tx.booking.update({
        where: { id: bookingId },
        data: {
          remainingAmount: remaining < 0 ? 0 : remaining,
          paymentStatus,
          status: bookingStatus,
        },
      });

      return p;
    });

    return { ...payment, amount: toNumber(payment.amount) };
  }

  async getPaymentHistory(bookingId: string): Promise<BookingPaymentEntity[]> {
    const payments = await this.prisma.bookingPayment.findMany({ where: { bookingId } });
    return payments.map((p) => ({ ...p, amount: toNumber(p.amount) }));
  }

  async findByDriverId(driverId: string, query: BookingQueryDto): Promise<Pagination<BookingEntity>> {
    const skip = (query.page - 1) * query.limit;

    const driverVehicles = await this.prisma.vehicle.findMany({
      where: { driverId },
      select: { id: true },
    });
    const vehicleIds = driverVehicles.map((v) => v.id);

    if (vehicleIds.length === 0) {
      return { data: [], total: 0, page: query.page, limit: query.limit, pages: 0 };
    }

    const where: any = { vehicleId: { in: vehicleIds } };
    if (query.status) where.status = query.status;
    if (query.paymentStatus) where.paymentStatus = query.paymentStatus;
    if (query.startDate) where.startDate = { gte: new Date(query.startDate) };
    if (query.endDate) where.endDate = { lte: new Date(query.endDate) };

    const [total, rows] = await Promise.all([
      this.prisma.booking.count({ where }),
      this.prisma.booking.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          passengers: true,
          payments: true,
          tourPackage: { select: { id: true, name: true, category: true } },
          vehicle: {
            select: {
              id: true,
              type: true,
              registrationNumber: true,
              vehicleModel: { select: { id: true, name: true } },
            },
          },
        },
      }),
    ]);

    return {
      data: rows.map((b) => this.mapBooking(b)),
      total,
      page: query.page,
      limit: query.limit,
      pages: Math.ceil(total / query.limit),
    };
  }

  private buildWhere(query: BookingQueryDto): any {
    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.paymentStatus) where.paymentStatus = query.paymentStatus;
    if (query.startDate || query.endDate) {
      where.startDate = {};
      if (query.startDate) where.startDate.gte = new Date(query.startDate);
      if (query.endDate) where.startDate.lte = new Date(query.endDate);
    }
    return where;
  }

  private async paginate(where: any, query: BookingQueryDto): Promise<Pagination<BookingEntity>> {
    const { page, limit } = query;
    const skip = (page - 1) * limit;
    const [total, rows] = await Promise.all([
      this.prisma.booking.count({ where }),
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { passengers: true, payments: true },
      }),
    ]);
    return { data: rows.map((b) => this.mapBooking(b)), total, page, limit, pages: Math.ceil(total / limit) };
  }

  private mapBooking(raw: any): BookingEntity {
    return {
      ...raw,
      totalCost: toNumber(raw.totalCost),
      advancePayment: raw.advancePayment != null ? toNumber(raw.advancePayment) : null,
      remainingAmount: toNumber(raw.remainingAmount),
      passengers: raw.passengers ?? [],
      payments: (raw.payments ?? []).map((p: any) => ({ ...p, amount: toNumber(p.amount) })),
    };
  }
}
