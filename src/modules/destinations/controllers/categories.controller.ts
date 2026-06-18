import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateCategoryDto } from '../dto/category.dto';
import { CategoriesService } from '../services/categories.service';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

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
  @ApiOperation({ summary: 'Create category (admin)' })
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.createCategory(dto);
  }
}
