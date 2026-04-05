import {
  Body,
  Controller,
  Post,
  Get,
  Delete,
  Param,
  ParseUUIDPipe,
  HttpCode,
  Query,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentService } from './comment.service';
import { ArticleService } from '../articles/article.service';
import { Comment } from './interfaces/comment.interface';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('comment')
@Controller('comment')
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    private readonly articleService: ArticleService,
  ) {}

  @Get()
  getComments(
    @Query('articleId', new ParseUUIDPipe()) articleId: string,
  ): Comment[] {
    return this.commentService.getCommentsByArticleId(articleId);
  }

  @Get(':id')
  getComment(@Param('id', new ParseUUIDPipe()) id: string): Comment {
    return this.commentService.getCommentById(id);
  }

  @Post()
  createComment(@Body() createCommentDto: CreateCommentDto): Comment {
    let articleExists = false;
    try {
      this.articleService.getArticle(createCommentDto.articleId);
      articleExists = true;
    } catch {}
    return this.commentService.createComment(createCommentDto, articleExists);
  }

  @Delete(':id')
  @HttpCode(204)
  deleteComment(@Param('id', new ParseUUIDPipe()) id: string): void {
    this.commentService.deleteComment(id);
  }
}
