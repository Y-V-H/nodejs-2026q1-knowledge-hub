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
import { CategoryService } from './categories.service';
import { Category } from './interfaces/category.interfaces';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'generated/prisma';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
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
  @Roles([Role.ADMIN])
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    return await this.categoryService.updateCategory(id, updateCategoryDto);
  }

  @Post()
  @Roles([Role.ADMIN])
  async createCategory(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    return await this.categoryService.createCategory(createCategoryDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles([Role.ADMIN])
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.categoryService.deleteCategory(id);
  }
}
