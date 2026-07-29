import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CreateCategoryDto } from '../dto/category.dto';
import { CategoriesService } from '../services/categories.service';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) { }

  @Get()
  @ApiOperation({ summary: 'List all categories' })
  findAll() {
    return this.categoriesService.getAllCategories();
  }

  @Get(':category')
  @ApiOperation({ summary: 'Get category by name' })
  @ApiParam({ name: 'category' })
  findOne(@Param('category') category: string) {
    return this.categoriesService.getCategoryByName(category);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create category (ADMIN only)' })
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.createCategory(dto);
  }
}
