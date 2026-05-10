import { randomUUID } from 'crypto';
import { Injectable, NotImplementedException, Logger } from '@nestjs/common';
import { RagChatRequestDto } from './dto/rag-chat-request.dto';
import { ReindexRequestDto } from './dto/reindex-request.dto';
import { RagSearchRequestDto } from './dto/rag-search-request.dto';

import type { ReindexResponse } from './interfaces/reindex-request.interface';
import type { RagSearchResponse } from './interfaces/rag-search-request.interface';
import type { RagChatResponse } from './interfaces/rag-chat-request.interface';

import { VectorStoreService } from './vector.service';
import { ChunkingService } from './chunking.service';
import { EmbeddingService } from './embedding.service';
import { ArticleService } from 'src/articles/article.service';
import { ConfigService } from '@nestjs/config';

import { NotFoundError } from 'src/errors';

import { ChunkPoint } from './interfaces/chunk-point.interface';

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);
  private readonly collectionName: string;

  constructor(
    private readonly articleService: ArticleService,
    private readonly chunkingService: ChunkingService,
    private readonly embeddingService: EmbeddingService,
    private readonly vectorStore: VectorStoreService,
    private readonly config: ConfigService,
  ) {
    this.collectionName = this.config.getOrThrow<string>(
      'RAG_VECTOR_COLLECTION',
    );
  }

  async reindex(dto: ReindexRequestDto): Promise<ReindexResponse> {
    try {
      const onlyPublished = dto.onlyPublished ?? true;

      const articles = await this.articleService.findForIndexing({
        onlyPublished,
        articleIds: dto.articleIds,
      });

      let indexedChunks = 0;

      for (const article of articles) {
        await this.vectorStore.deleteByArticleId(article.id);

        const chunks = this.chunkingService.split(article.content);
        if (chunks.length === 0) continue;

        const embeddings = await this.embeddingService.embedDocuments(chunks);

        const points: ChunkPoint[] = chunks.map((chunkText, index) => ({
          id: randomUUID(),
          vector: embeddings[index],
          payload: {
            articleId: article.id,
            articleTitle: article.title,
            chunkText,
            chunkIndex: index,
            status: article.status,
            categoryId: article.categoryId,
            tags: article.tags.map((t) => t.name),
          },
        }));

        await this.vectorStore.upsertChunks(points);
        indexedChunks += points.length;

        this.logger.log(
          `Indexed article ${article.id} (${points.length} chunks)`,
        );
      }

      const response = {
        indexedArticles: articles.length,
        indexedChunks,
        vectorCollection: this.collectionName,
      };
      this.logger.log('Response: ' + JSON.stringify(response));
      return response;
    } catch (err) {
      this.logger.error('Reindex failed', err);
      throw err;
    }
  }

  async search(dto: RagSearchRequestDto): Promise<RagSearchResponse> {
    const limit = dto.limit ?? 5;

    const queryVector = await this.embeddingService.embedQuery(dto.query);

    const filters = this.buildFilters(dto);

    const results = await this.vectorStore.search(queryVector, {
      limit,
      filters,
    });

    return {
      results: results.map((r) => ({
        articleId: r.payload.articleId as string,
        articleTitle: r.payload.articleTitle as string,
        chunk: r.payload.chunkText as string,
        similarity: r.score,
      })),
    };
  }

  private buildFilters(dto: RagSearchRequestDto) {
    const must: any[] = [];
    if (dto.articleStatus) {
      must.push({ key: 'status', match: { value: dto.articleStatus } });
    }
    if (dto.categoryId) {
      must.push({ key: 'categoryId', match: { value: dto.categoryId } });
    }
    if (dto.tags?.length) {
      must.push({ key: 'tags', match: { any: dto.tags } });
    }
    return must.length ? { must } : undefined;
  }

  async chat(dto: RagChatRequestDto): Promise<RagChatResponse> {
    this.logger.log(`chat called with question="${dto.question}"`);
    throw new NotImplementedException('chat is not implemented yet');
  }

  async removeArticleFromIndex(articleId: string): Promise<void> {
    const deleted = await this.vectorStore.deleteByArticleId(articleId);
    if (deleted === 0) {
      throw new NotFoundError(
        `No indexed vectors found for article ${articleId}`,
      );
    }
  }

  async getChatHistory(conversationId: string): Promise<any> {
    this.logger.log(`getChatHistory called for ${conversationId}`);
    throw new NotImplementedException('getChatHistory is not implemented yet');
  }
}
