import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, Patch, Post, Query, Req, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CreateInquiryDto, InquiryQueryDto, RespondInquiryDto, UpdateInquiryStatusDto } from '../dto/inquiry.dto';
import { InquiriesService } from '../services/inquiries.service';

@ApiTags('inquiries')
@Controller('inquiries')
export class InquiriesController {
  constructor(private readonly service: InquiriesService) { }

  @Post()
  @ApiOperation({ summary: 'Create inquiry (public)' })
  create(@Body() dto: CreateInquiryDto) {
    return this.service.createInquiry(dto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List inquiries (ADMIN only)' })
  findAll(@Query() query: InquiryQueryDto) {
    return this.service.getAllInquiries(query);
  }

  @Get(':id')
  @ApiParam({ name: 'id' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get inquiry with responses (ADMIN only)' })
  findOne(@Param('id') id: string) {
    return this.service.getInquiryById(id);
  }

  @Patch(':id')
  @ApiParam({ name: 'id' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update inquiry status/priority (ADMIN only)' })
  update(@Param('id') id: string, @Body() dto: UpdateInquiryStatusDto) {
    return this.service.updateInquiry(id, dto);
  }

  @Post(':id/respond')
  @ApiParam({ name: 'id' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Add response to inquiry (ADMIN only)' })
  respond(@Param('id') id: string, @Body() dto: RespondInquiryDto, @Req() req: any) {
    return this.service.respondToInquiry(id, dto, req.user?.id ?? 'admin');
  }

  @Get(':id/responses')
  @ApiParam({ name: 'id' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all responses for inquiry (ADMIN only)' })
  getResponses(@Param('id') id: string) {
    return this.service.getResponses(id);
  }

  @Post(':id/close')
  @ApiParam({ name: 'id' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Close inquiry (ADMIN only)' })
  close(@Param('id') id: string) {
    return this.service.closeInquiry(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete inquiry (ADMIN only — NEW status only)' })
  remove(@Param('id') id: string) {
    return this.service.deleteInquiry(id);
  }
}
