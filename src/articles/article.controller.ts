import {
  Body,
  Controller,
  Post,
  Get,
  Delete,
  Put,
  Param,
  ParseUUIDPipe,
  HttpCode,
  Query,
} from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ArticleService } from './article.service';
import { Article } from './interfaces/article.interface';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'generated/prisma';
import { Request } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('article')
@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  async getAllArticles(
    @Query('status') status?: string,
    @Query('categoryId') categoryId?: string,
    @Query('tag') tag?: string,
  ): Promise<Article[]> {
    return await this.articleService.getAllArticles(status, categoryId, tag);
  }

  @Get(':id')
  async findArticle(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<Article> {
    return await this.articleService.getArticle(id);
  }

  @Put(':id')
  @Roles([Role.ADMIN, Role.EDITOR])
  async updateArticle(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateArticleDto: UpdateArticleDto,
    @Request() req: any,
  ): Promise<Article> {
    return await this.articleService.updateArticle({
      id,
      updateArticleDto,
      userId: req.user.userId,
      userRole: req.user.role,
    });
  }

  @Post()
  @Roles([Role.ADMIN, Role.EDITOR])
  async createArticle(
    @Body() createArticleDto: CreateArticleDto,
  ): Promise<Article> {
    return await this.articleService.createArticle(createArticleDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles([Role.ADMIN])
  async removeArticle(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.articleService.deleteArticle(id);
  }
}
