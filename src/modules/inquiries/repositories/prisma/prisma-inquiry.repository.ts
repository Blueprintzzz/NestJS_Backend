import { Injectable } from '@nestjs/common';
import { InquiryStatus } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateInquiryDto, InquiryQueryDto, RespondInquiryDto, UpdateInquiryStatusDto } from '../../dto/inquiry.dto';
import { InquiryEntity, InquiryResponseEntity } from '../../entities/inquiry.entity';
import { IInquiryRepository, Pagination } from '../interfaces/inquiry.repository.interface';

@Injectable()
export class PrismaInquiryRepository implements IInquiryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateInquiryDto): Promise<InquiryEntity> {
    return this.prisma.inquiry.create({ data: dto, include: { responses: true } }) as any;
  }

  async findById(id: string): Promise<InquiryEntity | null> {
    const r = await this.prisma.inquiry.findUnique({ where: { id }, include: { responses: true } });
    return r as any;
  }

  async findAll(query: InquiryQueryDto): Promise<Pagination<InquiryEntity>> {
    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;
    if (query.category) where.category = query.category;
    if (query.assignedToAdminId) where.assignedToAdminId = query.assignedToAdminId;
    const skip = (query.page - 1) * query.limit;
    const [total, rows] = await Promise.all([
      this.prisma.inquiry.count({ where }),
      this.prisma.inquiry.findMany({ where, skip, take: query.limit, orderBy: { createdAt: 'desc' }, include: { responses: true } }),
    ]);
    return { data: rows as any[], total, page: query.page, limit: query.limit, pages: Math.ceil(total / query.limit) };
  }

  async update(id: string, dto: UpdateInquiryStatusDto): Promise<InquiryEntity> {
    return this.prisma.inquiry.update({ where: { id }, data: dto as any, include: { responses: true } }) as any;
  }

  async delete(id: string): Promise<boolean> {
    await this.prisma.inquiry.delete({ where: { id } });
    return true;
  }

  async addResponse(inquiryId: string, dto: RespondInquiryDto, adminId: string): Promise<InquiryResponseEntity> {
    const resp = await this.prisma.inquiryResponse.create({
      data: { inquiryId, respondedByAdminId: adminId, response: dto.response },
    });
    await this.prisma.inquiry.update({
      where: { id: inquiryId },
      data: { status: InquiryStatus.RESPONDED, respondedAt: new Date() },
    });
    return resp as any;
  }

  async getResponses(inquiryId: string): Promise<InquiryResponseEntity[]> {
    return this.prisma.inquiryResponse.findMany({ where: { inquiryId }, orderBy: { createdAt: 'asc' } }) as any;
  }

  async close(id: string): Promise<InquiryEntity> {
    return this.prisma.inquiry.update({ where: { id }, data: { status: InquiryStatus.CLOSED }, include: { responses: true } }) as any;
  }
}
