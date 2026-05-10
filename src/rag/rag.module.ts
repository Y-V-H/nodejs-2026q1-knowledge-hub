import { Module } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';
import { RagService } from './rag.service';
import { ChunkingService } from './chunking.service';
import { RagController } from './rag.controller';
import { EmbeddingService } from './embedding.service';
import { VectorStoreService } from './vector.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AiModule } from '../ai/ai.module';
import { ArticleModule } from 'src/articles/article.module';
import { QDRANT_CLIENT } from './const/qdrant';

@Module({
  imports: [AiModule, ConfigModule, ArticleModule],
  controllers: [RagController],
  providers: [
    RagService,
    ChunkingService,
    EmbeddingService,
    VectorStoreService,
    {
      provide: QDRANT_CLIENT,
      useFactory: (config: ConfigService) =>
        new QdrantClient({
          url: config.getOrThrow<string>('RAG_VECTOR_DB_URL'),
        }),
      inject: [ConfigService],
    },
  ],
})
export class RagModule {}
