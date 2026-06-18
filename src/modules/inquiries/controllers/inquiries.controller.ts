import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, Patch, Post, Query, Req,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateInquiryDto, InquiryQueryDto, RespondInquiryDto, UpdateInquiryStatusDto } from '../dto/inquiry.dto';
import { InquiriesService } from '../services/inquiries.service';

@ApiTags('inquiries')
@Controller('inquiries')
export class InquiriesController {
  constructor(private readonly service: InquiriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create inquiry (public)' })
  create(@Body() dto: CreateInquiryDto) {
    return this.service.createInquiry(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List inquiries (admin)' })
  findAll(@Query() query: InquiryQueryDto) {
    return this.service.getAllInquiries(query);
  }

  @Get(':id')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Get inquiry with responses (admin)' })
  findOne(@Param('id') id: string) {
    return this.service.getInquiryById(id);
  }

  @Patch(':id')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Update inquiry status/priority (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateInquiryStatusDto) {
    return this.service.updateInquiry(id, dto);
  }

  @Post(':id/respond')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Add response to inquiry (admin)' })
  respond(@Param('id') id: string, @Body() dto: RespondInquiryDto, @Req() req: any) {
    return this.service.respondToInquiry(id, dto, req.user?.id ?? 'admin');
  }

  @Get(':id/responses')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Get all responses for inquiry' })
  getResponses(@Param('id') id: string) {
    return this.service.getResponses(id);
  }

  @Post(':id/close')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Close inquiry (admin)' })
  close(@Param('id') id: string) {
    return this.service.closeInquiry(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Delete inquiry - NEW status only (admin)' })
  remove(@Param('id') id: string) {
    return this.service.deleteInquiry(id);
  }
}
