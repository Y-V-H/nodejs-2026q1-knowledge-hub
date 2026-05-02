import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GeminiService } from './services/gemini.service';
import { AiService } from './services/ai.service';
import { ArticleModule } from 'src/articles/article.module';
import { AiController } from './ai.controller';

@Module({
  imports: [HttpModule, ArticleModule],
  controllers: [AiController],
  providers: [GeminiService, AiService],
  exports: [],
})
export class AiModule {}
