import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, Patch, Post, Query, Req,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateReviewDto, ReviewQueryDto, UpdateReviewDto } from '../dto/review.dto';
import { ReviewsService } from '../services/reviews.service';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly service: ReviewsService) {}

  @Post()
  @ApiOperation({ summary: 'Create review (completed booking required)' })
  create(@Body() dto: CreateReviewDto, @Req() req: any) {
    return this.service.createReview(dto, req.user?.id ?? 'anonymous');
  }

  @Get()
  @ApiOperation({ summary: 'List approved reviews' })
  findAll(@Query() query: ReviewQueryDto) {
    return this.service.getAllReviews(query);
  }

  @Get(':id')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Get review details' })
  findOne(@Param('id') id: string) {
    return this.service.getReviewById(id);
  }

  @Patch(':id')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Update own review' })
  update(@Param('id') id: string, @Body() dto: UpdateReviewDto, @Req() req: any) {
    return this.service.updateReview(id, dto, req.user?.id ?? 'anonymous');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Delete own review' })
  remove(@Param('id') id: string, @Req() req: any) {
    return this.service.deleteReview(id, req.user?.id ?? 'anonymous');
  }

  @Post(':id/approve')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Approve review (admin)' })
  approve(@Param('id') id: string) {
    return this.service.approveReview(id);
  }

  @Post(':id/reject')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Reject review (admin)' })
  reject(@Param('id') id: string) {
    return this.service.rejectReview(id);
  }

  @Post(':id/helpful')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Mark review as helpful' })
  helpful(@Param('id') id: string) {
    return this.service.markHelpful(id);
  }
}
