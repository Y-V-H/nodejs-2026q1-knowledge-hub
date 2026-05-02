import {
  Body,
  Controller,
  Post,
  Param,
  ParseUUIDPipe,
  HttpCode,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiBearerAuth } from '@nestjs/swagger';
import {
  SummarizeArticleResponse,
  TranslateArticleResponse,
} from './interfaces/ai.interface';
import { AiService } from './services/ai.service';
import { SummarizeArticleDto } from './dto/summarize-article.dto';
import { TranslateArticleDto } from './dto/translate-article.dto';
import { AnalyzeArticleContentDto } from './dto/analyze-article.dto';
import { HttpStatus } from '@nestjs/common';

@ApiBearerAuth()
@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('/articles/:articleId/summarize')
  @HttpCode(HttpStatus.OK)
  async generatesSummary(
    @Param('articleId', ParseUUIDPipe) articleId: string,
    @Body() body: SummarizeArticleDto,
  ): Promise<SummarizeArticleResponse> {
    return await this.aiService.generatesSummary(articleId, body.maxLength);
  }

  @Post('/articles/:articleId/translate')
  async translatesArticle(
    @Param('articleId', ParseUUIDPipe) articleId: string,
    @Body() body: TranslateArticleDto,
  ): Promise<TranslateArticleResponse> {
    return await this.aiService.generateTranslation(articleId, body);
  }

  @Post('/articles/:articleId/analyze')
  async analyzeArticleContent(
    @Param('articleId', ParseUUIDPipe) articleId: string,
    @Body() body: AnalyzeArticleContentDto,
  ): Promise<any> {
    return await this.aiService.analyzeArticle(articleId, body.task);
  }

  @Post('generate')
  async genericPrompt(): Promise<any> {
    return undefined;
  }
}
