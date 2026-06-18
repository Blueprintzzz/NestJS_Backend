import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../../../../drizzle/drizzle.service';
import { CreateInquiryDto, InquiryQueryDto, RespondInquiryDto, UpdateInquiryStatusDto } from '../../dto/inquiry.dto';
import { InquiryEntity, InquiryResponseEntity } from '../../entities/inquiry.entity';
import { IInquiryRepository, Pagination } from '../interfaces/inquiry.repository.interface';

@Injectable()
export class DrizzleInquiryRepository implements IInquiryRepository {
  constructor(private readonly drizzle: DrizzleService) {}
  create(_dto: CreateInquiryDto): Promise<InquiryEntity> { throw new Error('Drizzle not implemented'); }
  findById(_id: string): Promise<InquiryEntity | null> { throw new Error('Drizzle not implemented'); }
  findAll(_query: InquiryQueryDto): Promise<Pagination<InquiryEntity>> { throw new Error('Drizzle not implemented'); }
  update(_id: string, _dto: UpdateInquiryStatusDto): Promise<InquiryEntity> { throw new Error('Drizzle not implemented'); }
  delete(_id: string): Promise<boolean> { throw new Error('Drizzle not implemented'); }
  addResponse(_inquiryId: string, _dto: RespondInquiryDto, _adminId: string): Promise<InquiryResponseEntity> { throw new Error('Drizzle not implemented'); }
  getResponses(_inquiryId: string): Promise<InquiryResponseEntity[]> { throw new Error('Drizzle not implemented'); }
  close(_id: string): Promise<InquiryEntity> { throw new Error('Drizzle not implemented'); }
}
