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
  getAllCategories(): Category[] {
    return this.categoryService.getAllCategories();
  }

  @Get(':id')
  findCategory(@Param('id', new ParseUUIDPipe()) id: string): Category {
    return this.categoryService.getCategory(id);
  }

  @Put(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Category {
    return this.categoryService.updateCategory(id, updateCategoryDto);
  }

  @Post()
  createCategory(@Body() createCategoryDto: CreateCategoryDto): Category {
    return this.categoryService.createCategory(createCategoryDto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.categoryService.deleteCategory(id);
  }
}
