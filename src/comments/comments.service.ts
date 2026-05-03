import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import type { Comment } from './interfaces/comment.interface';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundError } from 'src/errors';

const mapComment = (comment: any) => ({
  ...comment,
  createdAt: new Date(comment.createdAt).getTime(),
});

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

    return mapComment(
      await this.prisma.comment.create({
        data: {
          content: createCommentDto.content,
          authorId:
            createCommentDto.authorId !== undefined
              ? createCommentDto.authorId
              : userId,
          articleId: createCommentDto.articleId,
        },
      }),
    );
  }

  async getCommentsByArticleId(articleId: string): Promise<Comment[]> {
    const comments = await this.prisma.comment.findMany({
      where: { articleId },
    });
    return comments.map(mapComment);
  }

  async getCommentById(id: string): Promise<Comment> {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) throw new NotFoundError('Comment not found');
    return mapComment(comment);
  }

  async deleteComment(id: string): Promise<void> {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      throw new NotFoundError('Comment not found');
    }
    await this.prisma.comment.delete({ where: { id } });
  }
}
