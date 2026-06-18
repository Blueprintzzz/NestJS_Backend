import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../../../../drizzle/drizzle.service';
import { CreateReviewDto, ReviewQueryDto, UpdateReviewDto } from '../../dto/review.dto';
import { ReviewEntity } from '../../entities/review.entity';
import { IReviewRepository, Pagination } from '../interfaces/review.repository.interface';

@Injectable()
export class DrizzleReviewRepository implements IReviewRepository {
  constructor(private readonly drizzle: DrizzleService) {}
  create(_dto: CreateReviewDto, _userId: string): Promise<ReviewEntity> { throw new Error('Drizzle not implemented'); }
  findById(_id: string): Promise<ReviewEntity | null> { throw new Error('Drizzle not implemented'); }
  findAll(_query: ReviewQueryDto): Promise<Pagination<ReviewEntity>> { throw new Error('Drizzle not implemented'); }
  findByUserId(_userId: string, _query: ReviewQueryDto): Promise<Pagination<ReviewEntity>> { throw new Error('Drizzle not implemented'); }
  findByPackageId(_packageId: string, _query: ReviewQueryDto): Promise<{ data: ReviewEntity[]; avgRating: number; total: number }> { throw new Error('Drizzle not implemented'); }
  update(_id: string, _dto: UpdateReviewDto): Promise<ReviewEntity> { throw new Error('Drizzle not implemented'); }
  delete(_id: string): Promise<boolean> { throw new Error('Drizzle not implemented'); }
  setStatus(_id: string, _status: string): Promise<ReviewEntity> { throw new Error('Drizzle not implemented'); }
  incrementHelpful(_id: string): Promise<ReviewEntity> { throw new Error('Drizzle not implemented'); }
}
