import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ReviewStatus } from '@prisma/client';
import { CreateReviewDto, ReviewQueryDto, UpdateReviewDto } from '../dto/review.dto';
import { ReviewApprovedEvent, ReviewRejectedEvent } from '../events/review.events';
import { IReviewRepository, Pagination } from '../repositories/interfaces/review.repository.interface';
import { REVIEW_REPOSITORY } from '../repositories/repository.provider';
import { ReviewEntity } from '../entities/review.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @Inject(REVIEW_REPOSITORY) private readonly repo: IReviewRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createReview(dto: CreateReviewDto, userId: string): Promise<ReviewEntity> {
    if (dto.rating < 1 || dto.rating > 5) throw new BadRequestException('Rating must be between 1 and 5');
    return this.repo.create(dto, userId);
  }

  async getReviewById(id: string): Promise<ReviewEntity> {
    const review = await this.repo.findById(id);
    if (!review) throw new NotFoundException(`Review ${id} not found`);
    return review;
  }

  async getAllReviews(query: ReviewQueryDto): Promise<Pagination<ReviewEntity>> {
    return this.repo.findAll({ ...query, status: ReviewStatus.APPROVED });
  }

  async updateReview(id: string, dto: UpdateReviewDto, userId: string): Promise<ReviewEntity> {
    const review = await this.getReviewById(id);
    if (review.userId !== userId) throw new ForbiddenException('Cannot update another user\'s review');
    return this.repo.update(id, dto);
  }

  async deleteReview(id: string, userId: string): Promise<boolean> {
    const review = await this.getReviewById(id);
    if (review.userId !== userId) throw new ForbiddenException('Cannot delete another user\'s review');
    return this.repo.delete(id);
  }

  async approveReview(id: string): Promise<ReviewEntity> {
    const review = await this.getReviewById(id);
    const updated = await this.repo.setStatus(id, ReviewStatus.APPROVED);
    this.eventEmitter.emit('review.approved', new ReviewApprovedEvent(updated));
    return updated;
  }

  async rejectReview(id: string): Promise<ReviewEntity> {
    const review = await this.getReviewById(id);
    const updated = await this.repo.setStatus(id, ReviewStatus.REJECTED);
    this.eventEmitter.emit('review.rejected', new ReviewRejectedEvent(updated));
    return updated;
  }

  async markHelpful(id: string): Promise<ReviewEntity> {
    await this.getReviewById(id);
    return this.repo.incrementHelpful(id);
  }

  async getPackageReviews(packageId: string, query: ReviewQueryDto) {
    return this.repo.findByPackageId(packageId, query);
  }

  async getUserReviews(userId: string, query: ReviewQueryDto): Promise<Pagination<ReviewEntity>> {
    return this.repo.findByUserId(userId, query);
  }
}
