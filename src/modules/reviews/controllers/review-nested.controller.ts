import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ReviewQueryDto } from '../dto/review.dto';
import { ReviewsService } from '../services/reviews.service';

@ApiTags('package-reviews')
@Controller('packages/:packageId/reviews')
export class PackageReviewsController {
  constructor(private readonly service: ReviewsService) {}

  @Get()
  @ApiParam({ name: 'packageId' })
  @ApiOperation({ summary: 'Get reviews for a package with avg rating' })
  getPackageReviews(@Param('packageId') packageId: string, @Query() query: ReviewQueryDto) {
    return this.service.getPackageReviews(packageId, query);
  }
}

@ApiTags('user-reviews')
@Controller('users/:userId/reviews')
export class UserReviewsController {
  constructor(private readonly service: ReviewsService) {}

  @Get()
  @ApiParam({ name: 'userId' })
  @ApiOperation({ summary: 'Get reviews by user' })
  getUserReviews(@Param('userId') userId: string, @Query() query: ReviewQueryDto) {
    return this.service.getUserReviews(userId, query);
  }
}
