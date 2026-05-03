import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GeminiService } from './services/gemini.service';
import { AiService } from './services/ai.service';
import { ArticleModule } from 'src/articles/article.module';
import { AiController } from './ai.controller';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AiCacheService } from './services/ai-cache.service';
import { AiUsageService } from './services/ai-usage.service';

@Module({
  imports: [
    HttpModule,
    ArticleModule,
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: 60000,
          limit: Number(config.get<number>('AI_RATE_LIMIT_RPM')) ?? 20,
        },
      ],
    }),
  ],
  controllers: [AiController],
  providers: [GeminiService, AiService, AiCacheService, AiUsageService],
  exports: [],
})
export class AiModule {}
