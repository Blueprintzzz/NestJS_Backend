import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ReviewApprovedEvent, ReviewRejectedEvent } from '../events/review.events';

@Injectable()
export class ReviewApprovedListener {
  @OnEvent('review.approved')
  handle(payload: ReviewApprovedEvent): void {
    console.log(`[review.approved] id=${payload.review.id}`);
  }
}

@Injectable()
export class ReviewRejectedListener {
  @OnEvent('review.rejected')
  handle(payload: ReviewRejectedEvent): void {
    console.log(`[review.rejected] id=${payload.review.id}`);
  }
}
