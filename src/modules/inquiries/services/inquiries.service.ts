import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InquiryStatus } from '@prisma/client';
import { CreateInquiryDto, InquiryQueryDto, RespondInquiryDto, UpdateInquiryStatusDto } from '../dto/inquiry.dto';
import { InquiryCreatedEvent, InquiryRespondedEvent } from '../events/inquiry.events';
import { IInquiryRepository, Pagination } from '../repositories/interfaces/inquiry.repository.interface';
import { INQUIRY_REPOSITORY } from '../repositories/repository.provider';
import { InquiryEntity, InquiryResponseEntity } from '../entities/inquiry.entity';

@Injectable()
export class InquiriesService {
  constructor(
    @Inject(INQUIRY_REPOSITORY) private readonly repo: IInquiryRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createInquiry(dto: CreateInquiryDto): Promise<InquiryEntity> {
    const inquiry = await this.repo.create(dto);
    this.eventEmitter.emit('inquiry.created', new InquiryCreatedEvent(inquiry));
    return inquiry;
  }

  async getInquiryById(id: string): Promise<InquiryEntity> {
    const inquiry = await this.repo.findById(id);
    if (!inquiry) throw new NotFoundException(`Inquiry ${id} not found`);
    return inquiry;
  }

  async getAllInquiries(query: InquiryQueryDto): Promise<Pagination<InquiryEntity>> {
    return this.repo.findAll(query);
  }

  async updateInquiry(id: string, dto: UpdateInquiryStatusDto): Promise<InquiryEntity> {
    await this.getInquiryById(id);
    return this.repo.update(id, dto);
  }

  async respondToInquiry(id: string, dto: RespondInquiryDto, adminId: string): Promise<InquiryResponseEntity> {
    const inquiry = await this.getInquiryById(id);
    const response = await this.repo.addResponse(id, dto, adminId);
    this.eventEmitter.emit('inquiry.responded', new InquiryRespondedEvent(inquiry, dto.response));
    return response;
  }

  async getResponses(inquiryId: string): Promise<InquiryResponseEntity[]> {
    await this.getInquiryById(inquiryId);
    return this.repo.getResponses(inquiryId);
  }

  async closeInquiry(id: string): Promise<InquiryEntity> {
    await this.getInquiryById(id);
    return this.repo.close(id);
  }

  async deleteInquiry(id: string): Promise<boolean> {
    const inquiry = await this.getInquiryById(id);
    if (inquiry.status !== InquiryStatus.NEW) throw new BadRequestException('Can only delete NEW inquiries');
    return this.repo.delete(id);
  }
}
