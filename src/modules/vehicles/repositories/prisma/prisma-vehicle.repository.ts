import { ConflictException, Injectable } from '@nestjs/common';
import { ResourceStatus, VehicleType } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CheckAvailabilityDto, CreateVehicleDto, UpdateVehicleDto, VehicleQueryDto } from '../../dto/vehicle.dto';
import { VehicleAvailabilityEntity, VehicleEntity } from '../../entities/vehicle.entity';
import { IVehicleRepository, Pagination } from '../interfaces/vehicle.repository.interface';

function toNum(v: any): number {
  return typeof v === 'object' && v !== null ? parseFloat(v.toString()) : Number(v);
}

function mapVehicle(raw: any): VehicleEntity {
  return {
    ...raw,
    pricePerDay: toNum(raw.pricePerDay),
    images: Array.isArray(raw.images) ? raw.images : [],
    features: Array.isArray(raw.features) ? raw.features : [],
    availability: raw.availability ?? [],
  };
}

function dateRange(start: Date, end: Date): Date[] {
  const dates: Date[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    dates.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

@Injectable()
export class PrismaVehicleRepository implements IVehicleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateVehicleDto): Promise<VehicleEntity> {
    const v = await this.prisma.vehicle.create({ data: dto as any, include: { availability: false } });
    return mapVehicle(v);
  }

  async findById(id: string): Promise<VehicleEntity | null> {
    const v = await this.prisma.vehicle.findUnique({ where: { id }, include: { availability: { take: 30, orderBy: { date: 'asc' } } } });
    return v ? mapVehicle(v) : null;
  }

  async findAll(query: VehicleQueryDto): Promise<Pagination<VehicleEntity>> {
    return this.paginate(this.buildWhere(query), query);
  }

  async findByType(type: VehicleType, query: VehicleQueryDto): Promise<Pagination<VehicleEntity>> {
    return this.paginate({ ...this.buildWhere(query), type }, query);
  }

  async update(id: string, dto: UpdateVehicleDto): Promise<VehicleEntity> {
    const { id: _id, availability, createdAt, updatedAt, ...data } = dto as any;
    const v = await this.prisma.vehicle.update({ where: { id }, data, include: { availability: false } });
    return mapVehicle(v);
  }

  async delete(id: string): Promise<boolean> {
    await this.prisma.vehicle.delete({ where: { id } });
    return true;
  }

  async getAvailableVehicles(startDate: Date, endDate: Date, type?: VehicleType, minCapacity?: number): Promise<VehicleEntity[]> {
    const bookedIds = await this.prisma.vehicleAvailability.findMany({
      where: { date: { gte: startDate, lte: endDate }, isAvailable: false },
      select: { vehicleId: true },
    });
    const unavailableIds = [...new Set(bookedIds.map((b) => b.vehicleId))];
    const where: any = { status: ResourceStatus.ACTIVE, id: { notIn: unavailableIds } };
    if (type) where.type = type;
    if (minCapacity) where.capacity = { gte: minCapacity };
    const rows = await this.prisma.vehicle.findMany({ where });
    return rows.map(mapVehicle);
  }

  async reserveVehicle(vehicleId: string, bookingId: string, startDate: Date, endDate: Date): Promise<void> {
    const dates = dateRange(startDate, endDate);
    for (const date of dates) {
      const existing = await this.prisma.vehicleAvailability.findUnique({ where: { vehicleId_date: { vehicleId, date } } });
      if (existing && !existing.isAvailable) throw new ConflictException(`Vehicle unavailable on ${date.toDateString()}`);
    }
    await this.prisma.$transaction(
      dates.map((date) =>
        this.prisma.vehicleAvailability.upsert({
          where: { vehicleId_date: { vehicleId, date } },
          create: { vehicleId, date, isAvailable: false, bookedByBookingId: bookingId },
          update: { isAvailable: false, bookedByBookingId: bookingId },
        }),
      ),
    );
  }

  async releaseVehicle(bookingId: string): Promise<void> {
    await this.prisma.vehicleAvailability.updateMany({
      where: { bookedByBookingId: bookingId },
      data: { isAvailable: true, bookedByBookingId: null },
    });
  }

  async getAvailabilityCalendar(vehicleId: string, days: number): Promise<VehicleAvailabilityEntity[]> {
    const from = new Date();
    const to = new Date();
    to.setDate(to.getDate() + days);
    return this.prisma.vehicleAvailability.findMany({
      where: { vehicleId, date: { gte: from, lte: to } },
      orderBy: { date: 'asc' },
    }) as any;
  }

  private buildWhere(query: VehicleQueryDto): any {
    const where: any = { status: ResourceStatus.ACTIVE };
    if (query.type) where.type = query.type;
    if (query.minCapacity) where.capacity = { gte: query.minCapacity };
    if (query.maxPrice) where.pricePerDay = { lte: query.maxPrice };
    return where;
  }

  private async paginate(where: any, query: VehicleQueryDto): Promise<Pagination<VehicleEntity>> {
    const skip = (query.page - 1) * query.limit;
    const [total, rows] = await Promise.all([
      this.prisma.vehicle.count({ where }),
      this.prisma.vehicle.findMany({ where, skip, take: query.limit, orderBy: { createdAt: 'desc' } }),
    ]);
    return { data: rows.map(mapVehicle), total, page: query.page, limit: query.limit, pages: Math.ceil(total / query.limit) };
  }
}
