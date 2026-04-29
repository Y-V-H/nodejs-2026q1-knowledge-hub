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
import { Comment } from './interfaces/comment.interface';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('comment')
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get()
  async getComments(
    @Query('articleId', new ParseUUIDPipe()) articleId: string,
  ): Promise<Comment[]> {
    return await this.commentService.getCommentsByArticleId(articleId);
  }

  @Get(':id')
  async getComment(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<Comment> {
    return await this.commentService.getCommentById(id);
  }

  @Post()
  async createComment(
    @Body() createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    return await this.commentService.createComment(createCommentDto);
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteComment(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<void> {
    await this.commentService.deleteComment(id);
  }
}
