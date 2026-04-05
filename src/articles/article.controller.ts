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

@ApiTags('article')
@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  getAllArticles(
    @Query('status') status?: string,
    @Query('categoryId') categoryId?: string,
    @Query('tag') tag?: string,
  ): Article[] {
    return this.articleService.getAllArticles(status, categoryId, tag);
  }

  @Get(':id')
  findArticle(@Param('id', new ParseUUIDPipe()) id: string): Article {
    return this.articleService.getArticle(id);
  }

  @Put(':id')
  updateArticle(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateArticleDto: UpdateArticleDto,
  ): Article {
    return this.articleService.updateArticle(id, updateArticleDto);
  }

  @Post()
  createArticle(@Body() createUserDto: CreateArticleDto): Article {
    return this.articleService.createArticle(createUserDto);
  }

  @Delete(':id')
  @HttpCode(204)
  removeArticle(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.articleService.deleteArticle(id);
  }
}
