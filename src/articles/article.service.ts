import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import type { Article } from './interfaces/article.interface';
import { randomUUID } from 'crypto';
import { ArticleStatus } from './enum/article-status.enum';
import { CommentService } from '../comments/comment.service';

@Injectable()
export class ArticleService {
  private articles: Article[] = [];
  constructor(private readonly commentService: CommentService) {}

  createArticle(createArticleDto: CreateArticleDto): Article {
    const newArticle: Article = {
      ...createArticleDto,
      id: randomUUID(),
      categoryId: createArticleDto.categoryId ?? null,
      authorId: createArticleDto.authorId ?? null,
      tags: createArticleDto.tags ?? [],
      status: createArticleDto.status ?? ArticleStatus.DRAFT,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.articles.push(newArticle);

    return newArticle;
  }

  getAllArticles(
    status?: string,
    categoryId?: string,
    tag?: string,
  ): Article[] {
    return this.articles.filter((article) => {
      if (status && article.status !== status) return false;
      if (categoryId && article.categoryId !== categoryId) return false;
      if (
        tag &&
        !article.tags
          .map((tag) => tag.toLowerCase())
          .includes(tag.toLowerCase())
      )
        return false;
      return true;
    });
  }

  getArticle(id: string) {
    const article = this.articles.find((article) => article.id === id);
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return article;
  }

  updateArticle(id: string, updateArticleDto: UpdateArticleDto) {
    const index = this.articles.findIndex((article) => article.id === id);
    if (index === -1) {
      throw new NotFoundException('Article not found');
    }

    this.articles[index] = {
      ...this.articles[index],
      ...updateArticleDto,
      updatedAt: Date.now(),
    };

    return this.articles[index];
  }

  deleteArticle(id: string) {
    const index = this.articles.findIndex((article) => article.id === id);
    if (index === -1) {
      throw new NotFoundException('Article not found');
    }

    this.commentService.deleteCommentsByArticleId(id);
    this.articles.splice(index, 1);
  }

  nullifyAuthorId(authorId: string): void {
    this.articles = this.articles.map((article) =>
      article.authorId === authorId ? { ...article, authorId: null } : article,
    );
  }

  nullifyCategoryId(categoryId: string): void {
    this.articles = this.articles.map((article) =>
      article.categoryId === categoryId
        ? { ...article, categoryId: null }
        : article,
    );
  }
}
