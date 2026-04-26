import { Injectable } from '@nestjs/common';
import { NotFoundError, ForbiddenError } from 'src/errors';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import type { Article } from './interfaces/article.interface';
import { PrismaService } from '../prisma/prisma.service';
import { Status, Prisma } from '../../generated/prisma';
import { Role } from '../../generated/prisma';

interface UpdateArticleProps {
  id: string;
  updateArticleDto: UpdateArticleDto;
  userId: string;
  userRole: Role;
}

@Injectable()
export class ArticleService {
  constructor(private readonly prisma: PrismaService) {}

  async createArticle(createArticleDto: CreateArticleDto): Promise<Article> {
    const {
      tags = [],
      title,
      content,
      status,
      categoryId,
      authorId,
    } = createArticleDto;

    const article = await this.prisma.article.create({
      data: {
        title,
        content,
        status,
        categoryId,
        authorId,
        tags: {
          connectOrCreate: tags.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
      },
      include: { tags: true },
    });

    return article;
  }

  async getAllArticles(
    status?: string,
    categoryId?: string,
    tag?: string,
  ): Promise<Article[]> {
    const where: Prisma.ArticleWhereInput = {};

    if (status) where.status = status as Status;
    if (categoryId) where.categoryId = categoryId;
    if (tag) where.tags = { some: { name: tag } };

    const articles = await this.prisma.article.findMany({
      where,
      include: { tags: true },
    });

    return articles;
  }

  async getArticle(id: string) {
    const article = await this.prisma.article.findUnique({
      where: { id },
      include: { tags: true },
    });
    if (!article) {
      throw new NotFoundError('Article not found');
    }

    return article;
  }

  async updateArticle({
    id,
    updateArticleDto,
    userId,
    userRole,
  }: UpdateArticleProps) {
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) {
      throw new NotFoundError('Article not found');
    }

    if (userRole !== Role.ADMIN && article.authorId !== userId) {
      throw new ForbiddenError('You can only edit your own articles');
    }

    const { tags, title, content, status, categoryId, authorId } =
      updateArticleDto;

    return await this.prisma.article.update({
      where: { id },
      data: {
        title,
        content,
        status,
        categoryId,
        authorId,
        tags: tags
          ? {
              set: [],
              connectOrCreate: tags.map((name) => ({
                where: { name },
                create: { name },
              })),
            }
          : undefined,
      },
      include: { tags: true },
    });
  }

  async deleteArticle(id: string) {
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) {
      throw new NotFoundError('Article not found');
    }
    await this.prisma.article.delete({ where: { id } });
  }
}
