import { ReviewEntity } from '../entities/review.entity';

export class ReviewApprovedEvent {
  constructor(public readonly review: ReviewEntity) {}
}

export class ReviewRejectedEvent {
  constructor(public readonly review: ReviewEntity) {}
}
