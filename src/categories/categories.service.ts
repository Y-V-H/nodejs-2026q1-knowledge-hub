import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import type { Category } from './interfaces/category.interfaces';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundError } from 'src/errors';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async createCategory(
    createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    const category = await this.prisma.category.create({
      data: createCategoryDto,
    });

    return category;
  }

  async getAllCategories(): Promise<Category[]> {
    return await this.prisma.category.findMany();
  }

  async getCategory(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    return category;
  }

  async updateCategory(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    const updatedCategory = await this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });

    return updatedCategory;
  }

  async deleteCategory(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    await this.prisma.category.delete({ where: { id } });
  }
}
