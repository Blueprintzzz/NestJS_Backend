import { CreateReviewDto, ReviewQueryDto, UpdateReviewDto } from '../../dto/review.dto';
import { ReviewEntity } from '../../entities/review.entity';

export interface Pagination<T> { data: T[]; total: number; page: number; limit: number; pages: number; }

export interface IReviewRepository {
  create(dto: CreateReviewDto, userId: string): Promise<ReviewEntity>;
  findById(id: string): Promise<ReviewEntity | null>;
  findAll(query: ReviewQueryDto): Promise<Pagination<ReviewEntity>>;
  findByUserId(userId: string, query: ReviewQueryDto): Promise<Pagination<ReviewEntity>>;
  findByPackageId(packageId: string, query: ReviewQueryDto): Promise<{ data: ReviewEntity[]; avgRating: number; total: number }>;
  update(id: string, dto: UpdateReviewDto): Promise<ReviewEntity>;
  delete(id: string): Promise<boolean>;
  setStatus(id: string, status: string): Promise<ReviewEntity>;
  incrementHelpful(id: string): Promise<ReviewEntity>;
}
