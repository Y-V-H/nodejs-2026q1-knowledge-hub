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
import { CommentService } from './comments.service';
import { Comment } from './interfaces/comment.interface';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'generated/prisma';
import { Request } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
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
  @Roles([Role.ADMIN, Role.EDITOR])
  async createComment(
    @Body() createCommentDto: CreateCommentDto,
    @Request() req: any,
  ): Promise<Comment> {
    return await this.commentService.createComment(
      createCommentDto,
      req.user.userId,
    );
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles([Role.ADMIN])
  async deleteComment(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<void> {
    await this.commentService.deleteComment(id);
  }
}
