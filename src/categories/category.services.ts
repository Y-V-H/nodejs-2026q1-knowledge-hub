import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import type { Category } from './interfaces/category.interfaces';
import { randomUUID } from 'crypto';
import { ArticleService } from 'src/articles/article.service';

@Injectable()
export class CategoryService {
  private categories: Category[] = [];

  constructor(private readonly articleService: ArticleService) {}

  createCategory(createCategoryDto: CreateCategoryDto): Category {
    const newCategory: Category = {
      ...createCategoryDto,
      id: randomUUID(),
    };
    this.categories.push(newCategory);

    return newCategory;
  }

  getAllCategories(): Category[] {
    return this.categories;
  }

  getCategory(id: string) {
    const category = this.categories.find((category) => category.id === id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  updateCategory(id: string, updateCategoryDto: UpdateCategoryDto) {
    const index = this.categories.findIndex((category) => category.id === id);
    if (index === -1) {
      throw new NotFoundException('Category not found');
    }

    this.categories[index] = {
      ...this.categories[index],
      ...updateCategoryDto,
    };

    return this.categories[index];
  }

  deleteCategory(id: string) {
    const index = this.categories.findIndex((category) => category.id === id);
    if (index === -1) {
      throw new NotFoundException('Category not found');
    }

    this.articleService.nullifyCategoryId(id);
    this.categories.splice(index, 1);
  }
}
