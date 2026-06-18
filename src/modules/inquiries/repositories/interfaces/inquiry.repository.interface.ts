import { CreateInquiryDto, InquiryQueryDto, RespondInquiryDto, UpdateInquiryStatusDto } from '../../dto/inquiry.dto';
import { InquiryEntity, InquiryResponseEntity } from '../../entities/inquiry.entity';

export interface Pagination<T> { data: T[]; total: number; page: number; limit: number; pages: number; }

export interface IInquiryRepository {
  create(dto: CreateInquiryDto): Promise<InquiryEntity>;
  findById(id: string): Promise<InquiryEntity | null>;
  findAll(query: InquiryQueryDto): Promise<Pagination<InquiryEntity>>;
  update(id: string, dto: UpdateInquiryStatusDto): Promise<InquiryEntity>;
  delete(id: string): Promise<boolean>;
  addResponse(inquiryId: string, dto: RespondInquiryDto, adminId: string): Promise<InquiryResponseEntity>;
  getResponses(inquiryId: string): Promise<InquiryResponseEntity[]>;
  close(id: string): Promise<InquiryEntity>;
}
