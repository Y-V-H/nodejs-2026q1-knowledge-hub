import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
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

const mapArticle = (article: any) => ({
  ...article,
  status: article.status.toLowerCase(),
  tags: article.tags.map((t: any) => t.name),
  createdAt: new Date(article.createdAt).getTime(),
  updatedAt: new Date(article.updatedAt).getTime(),
});

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

    const article = await this.prisma.article.upsert({
      where: { title },
      update: { content, status, categoryId, authorId },
      create: {
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

    return mapArticle(article);
  }

  async getAllArticles(
    status?: string,
    categoryId?: string,
    tag?: string,
  ): Promise<Article[]> {
    const where: Prisma.ArticleWhereInput = {};

    if (status) where.status = status.toUpperCase() as Status;
    if (categoryId) where.categoryId = categoryId;
    if (tag) where.tags = { some: { name: tag } };

    const articles = await this.prisma.article.findMany({
      where,
      include: { tags: true },
    });

    return articles.map(mapArticle);
  }

  async getArticle(id: string) {
    const article = await this.prisma.article.findUnique({
      where: { id },
      include: { tags: true },
    });
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return mapArticle(article);
  }

  async updateArticle({
    id,
    updateArticleDto,
    userId,
    userRole,
  }: UpdateArticleProps) {
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (userRole !== Role.ADMIN && article.authorId !== userId) {
      throw new ForbiddenException('You can only edit your own articles');
    }

    const { tags, title, content, status, categoryId, authorId } =
      updateArticleDto;

    return mapArticle(
      await this.prisma.article.update({
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
      }),
    );
  }

  async deleteArticle(id: string) {
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    await this.prisma.article.delete({ where: { id } });
  }
}
