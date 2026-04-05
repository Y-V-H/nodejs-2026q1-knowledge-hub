import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import type { Comment } from './interfaces/comment.interface';
import { randomUUID } from 'crypto';

@Injectable()
export class CommentService {
  private comments: Comment[] = [];

  createComment(
    createCommentDto: CreateCommentDto,
    articleExists: boolean,
  ): Comment {
    if (!articleExists) {
      throw new UnprocessableEntityException('Article not found');
    }

    const newComment: Comment = {
      ...createCommentDto,
      id: randomUUID(),
      authorId: createCommentDto.authorId ?? null,
      createdAt: Date.now(),
    };
    this.comments.push(newComment);

    return newComment;
  }

  getCommentsByArticleId(articleId: string): Comment[] {
    return this.comments.filter((comment) => comment.articleId === articleId);
  }

  getCommentById(id: string): Comment {
    const comment = this.comments.find((c) => c.id === id);
    if (!comment) throw new NotFoundException('Comment not found');
    return comment;
  }

  deleteComment(id: string): void {
    const index = this.comments.findIndex((comment) => comment.id === id);
    if (index === -1) {
      throw new NotFoundException('Comment not found');
    }
    this.comments.splice(index, 1);
  }

  deleteCommentsByArticleId(articleId: string): void {
    this.comments = this.comments.filter(
      (comment) => comment.articleId !== articleId,
    );
  }

  deleteCommentsByAuthorId(authorId: string): void {
    this.comments = this.comments.filter(
      (comment) => comment.authorId !== authorId,
    );
  }
}
