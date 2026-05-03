import {
  Body,
  Controller,
  Post,
  Param,
  ParseUUIDPipe,
  HttpCode,
  UseGuards,
  Get,
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
import { ThrottlerGuard, SkipThrottle } from '@nestjs/throttler';
import { AiUsageService } from './services/ai-usage.service';
import { GenerateDto } from './dto/generate.dto';

@UseGuards(ThrottlerGuard)
@ApiBearerAuth()
@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly aiUsageService: AiUsageService,
  ) {}

  @Post('/articles/:articleId/summarize')
  @HttpCode(HttpStatus.OK)
  async generatesSummary(
    @Param('articleId', ParseUUIDPipe) articleId: string,
    @Body() body: SummarizeArticleDto,
  ): Promise<SummarizeArticleResponse> {
    return await this.aiService.generatesSummary(articleId, body.maxLength);
  }

  @Post('/articles/:articleId/translate')
  @HttpCode(HttpStatus.OK)
  async translatesArticle(
    @Param('articleId', ParseUUIDPipe) articleId: string,
    @Body() body: TranslateArticleDto,
  ): Promise<TranslateArticleResponse> {
    return await this.aiService.generateTranslation(articleId, body);
  }

  @Post('/articles/:articleId/analyze')
  @HttpCode(HttpStatus.OK)
  async analyzeArticleContent(
    @Param('articleId', ParseUUIDPipe) articleId: string,
    @Body() body: AnalyzeArticleContentDto,
  ): Promise<any> {
    return await this.aiService.analyzeArticle(articleId, body.task);
  }

  @Post('/generate')
  @HttpCode(HttpStatus.OK)
  async genericPrompt(@Body() body: GenerateDto) {
    const text = await this.aiService.generic(body.prompt);

    return { text };
  }

  @Get('/usage')
  @SkipThrottle()
  @HttpCode(HttpStatus.OK)
  getUsage() {
    return this.aiUsageService.getStats();
  }
}
