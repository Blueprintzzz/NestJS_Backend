import { forwardRef, Module } from '@nestjs/common';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { PackageReviewsController, UserReviewsController } from './controllers/review-nested.controller';
import { ReviewsController } from './controllers/reviews.controller';
import { ReviewApprovedListener, ReviewRejectedListener } from './listeners/review.listeners';
import { reviewRepositoryProvider } from './repositories/repository.provider';
import { ReviewsService } from './services/reviews.service';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [ReviewsController, PackageReviewsController, UserReviewsController],
  providers: [
    PrismaService,
    DrizzleService,
    reviewRepositoryProvider,
    ReviewsService,
    ReviewApprovedListener,
    ReviewRejectedListener,
  ],
  exports: [ReviewsService],
})
export class ReviewsModule { }
