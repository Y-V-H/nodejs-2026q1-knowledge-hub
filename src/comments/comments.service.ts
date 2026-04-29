import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import type { Comment } from './interfaces/comment.interface';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommentService {
  constructor(private readonly prisma: PrismaService) {}

  async createComment(
    createCommentDto: CreateCommentDto,
    userId: string,
  ): Promise<Comment> {
    const article = await this.prisma.article.findUnique({
      where: { id: createCommentDto.articleId },
    });

    if (!article) {
      throw new UnprocessableEntityException('Article not found');
    }

    return await this.prisma.comment.create({
      data: {
        content: createCommentDto.content,
        authorId: userId,
        articleId: createCommentDto.articleId,
      },
    });
  }

  async getCommentsByArticleId(articleId: string): Promise<Comment[]> {
    return await this.prisma.comment.findMany({ where: { articleId } });
  }

  async getCommentById(id: string): Promise<Comment> {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');
    return comment;
  }

  async deleteComment(id: string): Promise<void> {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    await this.prisma.comment.delete({ where: { id } });
  }
}
