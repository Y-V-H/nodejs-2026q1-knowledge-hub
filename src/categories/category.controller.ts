import {
  Body,
  Controller,
  Post,
  Get,
  Delete,
  Put,
  Param,
  ParseUUIDPipe,
  HttpCode,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryService } from './category.services';
import { Category } from './interfaces/category.interfaces';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('category')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async getAllCategories(): Promise<Category[]> {
    return await this.categoryService.getAllCategories();
  }

  @Get(':id')
  async findCategory(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<Category> {
    return await this.categoryService.getCategory(id);
  }

  @Put(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    return await this.categoryService.updateCategory(id, updateCategoryDto);
  }

  @Post()
  async createCategory(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    return await this.categoryService.createCategory(createCategoryDto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.categoryService.deleteCategory(id);
  }
}
