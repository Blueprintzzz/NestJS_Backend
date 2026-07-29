import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CreateReviewDto, ReviewQueryDto, UpdateReviewDto } from '../dto/review.dto';
import { ReviewsService } from '../services/reviews.service';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly service: ReviewsService) { }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TOURIST)
  @ApiOperation({ summary: 'Create review (TOURIST only — completed booking required)' })
  create(@Body() dto: CreateReviewDto, @CurrentUser() user: any) {
    return this.service.createReview(dto, user.id);
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
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TOURIST)
  @ApiOperation({ summary: 'Update own review (TOURIST only)' })
  update(@Param('id') id: string, @Body() dto: UpdateReviewDto, @CurrentUser() user: any) {
    return this.service.updateReview(id, dto, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete review (ADMIN only)' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.deleteReview(id, user.id);
  }

  @Post(':id/approve')
  @ApiParam({ name: 'id' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Approve review (ADMIN only)' })
  approve(@Param('id') id: string) {
    return this.service.approveReview(id);
  }

  @Post(':id/reject')
  @ApiParam({ name: 'id' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Reject review (ADMIN only)' })
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
