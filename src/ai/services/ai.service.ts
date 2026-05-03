import { Injectable } from '@nestjs/common';
import { ArticleService } from 'src/articles/article.service';
import { buildSummarizePrompt } from '../prompts/summarize.prompt';
import { buildTranslatePrompt } from '../prompts/translate.prompt';
import { buildAnalyzeArticlePrompt } from '../prompts/analyze.prompt';
import type {
  SummarizeArticleResponse,
  AnalyzeArticleResponse,
  AnalyzeArticleType,
} from '../interfaces/ai.interface';
import { GeminiService } from './gemini.service';
import {
  SummaryLength,
  TranslateArticleRequest,
  TranslateArticleResponse,
} from '../interfaces/ai.interface';
import { InternalServerErrorException } from '@nestjs/common';
import { AiCacheService } from './ai-cache.service';

@Injectable()
export class AiService {
  constructor(
    private readonly articleService: ArticleService,
    private readonly geminiService: GeminiService,
    private readonly aiCacheService: AiCacheService,
  ) {}

  async generatesSummary(
    articleId: string,
    maxLength: SummaryLength = 'medium',
  ): Promise<SummarizeArticleResponse> {
    const article = await this.articleService.getArticle(articleId);
    const cacheKey = `summarize:${articleId}:${maxLength}:${article.updatedAt}`;
    const cachedData = this.aiCacheService.get(cacheKey);
    if (cachedData) {
      return cachedData as SummarizeArticleResponse;
    }
    const prompt = buildSummarizePrompt(article.content, maxLength);
    const { text } = await this.geminiService.generate(prompt);

    const response = {
      articleId,
      summary: text,
      originalLength: article.content.length,
      summaryLength: text.length,
    };

    this.aiCacheService.set({ key: cacheKey, value: response });

    return response;
  }

  async generateTranslation(
    articleId: string,
    body: TranslateArticleRequest,
  ): Promise<TranslateArticleResponse> {
    const article = await this.articleService.getArticle(articleId);
    const cacheKey = `translation:${articleId}:${body.sourceLanguage}:${body.targetLanguage}:${article.updatedAt}`;
    const cachedData = this.aiCacheService.get(cacheKey);
    if (cachedData) {
      return cachedData as TranslateArticleResponse;
    }
    const prompt = buildTranslatePrompt(article.content, body);
    const { text } = await this.geminiService.generate(prompt);

    const response = {
      articleId,
      translatedText: text,
      detectedLanguage: body.sourceLanguage ?? 'auto-detected',
    };

    this.aiCacheService.set({ key: cacheKey, value: response });

    return response;
  }

  async analyzeArticle(
    articleId: string,
    task: AnalyzeArticleType = 'review',
  ): Promise<AnalyzeArticleResponse> {
    const article = await this.articleService.getArticle(articleId);
    const prompt = buildAnalyzeArticlePrompt(article.content, task);
    const { text } = await this.geminiService.generate(prompt);
    const cleaned = text.replace(/```json|```/g, '').trim();
    let parsed;

    try {
      parsed = JSON.parse(cleaned);
    } catch {
      throw new InternalServerErrorException('Failed to parse AI response');
    }

    return {
      articleId,
      analysis: parsed.analysis,
      suggestions: parsed.suggestions,
      severity: parsed.severity,
    };
  }
}
