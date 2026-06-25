import { Injectable } from '@nestjs/common';
import { ReviewStatus } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateReviewDto, ReviewQueryDto, UpdateReviewDto } from '../../dto/review.dto';
import { ReviewEntity } from '../../entities/review.entity';
import { IReviewRepository, Pagination } from '../interfaces/review.repository.interface';

function mapReview(raw: any): ReviewEntity {
  return { ...raw, images: Array.isArray(raw.images) ? raw.images : [] };
}

@Injectable()
export class PrismaReviewRepository implements IReviewRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateReviewDto, userId: string): Promise<ReviewEntity> {
    const review = await this.prisma.review.create({
      data: { bookingId: dto.bookingId, userId, rating: dto.rating, title: dto.title, description: dto.description, images: dto.images },
    });
    return mapReview(review);
  }

  async findById(id: string): Promise<ReviewEntity | null> {
    const r = await this.prisma.review.findUnique({ where: { id } });
    return r ? mapReview(r) : null;
  }

  async findAll(query: ReviewQueryDto): Promise<Pagination<ReviewEntity>> {
    const where = this.buildWhere(query);
    const skip = (query.page - 1) * query.limit;
    const [total, rows] = await Promise.all([
      this.prisma.review.count({ where }),
      this.prisma.review.findMany({ where, skip, take: query.limit, orderBy: { createdAt: 'desc' } }),
    ]);
    return { data: rows.map(mapReview), total, page: query.page, limit: query.limit, pages: Math.ceil(total / query.limit) };
  }

  async findByUserId(userId: string, query: ReviewQueryDto): Promise<Pagination<ReviewEntity>> {
    const where = { ...this.buildWhere(query), userId };
    const skip = (query.page - 1) * query.limit;
    const [total, rows] = await Promise.all([
      this.prisma.review.count({ where }),
      this.prisma.review.findMany({ where, skip, take: query.limit, orderBy: { createdAt: 'desc' } }),
    ]);
    return { data: rows.map(mapReview), total, page: query.page, limit: query.limit, pages: Math.ceil(total / query.limit) };
  }

  async findByPackageId(packageId: string, query: ReviewQueryDto): Promise<{ data: ReviewEntity[]; avgRating: number; total: number }> {
    const bookings = await this.prisma.booking.findMany({ where: { tourPackageId: packageId }, select: { id: true } });
    const bookingIds = bookings.map((b) => b.id);
    const where = { bookingId: { in: bookingIds }, status: ReviewStatus.APPROVED };
    const [total, rows, agg] = await Promise.all([
      this.prisma.review.count({ where }),
      this.prisma.review.findMany({ where, take: query.limit, skip: (query.page - 1) * query.limit }),
      this.prisma.review.aggregate({ where, _avg: { rating: true } }),
    ]);
    return { data: rows.map(mapReview), avgRating: agg._avg.rating ?? 0, total };
  }

  async update(id: string, dto: UpdateReviewDto): Promise<ReviewEntity> {
    const r = await this.prisma.review.update({ where: { id }, data: dto });
    return mapReview(r);
  }

  async delete(id: string): Promise<boolean> {
    await this.prisma.review.delete({ where: { id } });
    return true;
  }

  async setStatus(id: string, status: string): Promise<ReviewEntity> {
    const r = await this.prisma.review.update({ where: { id }, data: { status: status as ReviewStatus } });
    return mapReview(r);
  }

  async incrementHelpful(id: string): Promise<ReviewEntity> {
    const r = await this.prisma.review.update({ where: { id }, data: { helpful: { increment: 1 } } });
    return mapReview(r);
  }

  private buildWhere(query: ReviewQueryDto): any {
    const where: any = {};
    if (query.rating) where.rating = query.rating;
    if (query.bookingId) where.bookingId = query.bookingId;
    if (query.status) where.status = query.status;
    return where;
  }
}
