import {
  Injectable,
  Inject,
  Logger,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { QDRANT_CLIENT } from './const/qdrant';
import { QdrantClient } from '@qdrant/js-client-rest';
import { ConfigService } from '@nestjs/config';
import { ChunkPoint } from './interfaces/chunk-point.interface';

@Injectable()
export class VectorStoreService implements OnModuleInit {
  private readonly logger = new Logger(VectorStoreService.name);
  private readonly collectionName: string;
  private readonly vectorSize = 768;

  constructor(
    @Inject(QDRANT_CLIENT) private readonly client: QdrantClient,
    private readonly config: ConfigService,
  ) {
    this.collectionName = this.config.getOrThrow<string>(
      'RAG_VECTOR_COLLECTION',
    );
  }

  async onModuleInit() {
    await this.ensureCollection();
    await this.ensurePayloadIndexes();
  }

  private async ensureCollection(): Promise<void> {
    try {
      await this.client.getCollection(this.collectionName);
      this.logger.log(`Collection "${this.collectionName}" already exists`);
    } catch (err: any) {
      this.logger.error(`Qdrant upsert failed: ${(err as Error).message}`);
      throw new ServiceUnavailableException('Vector store is unavailable');
    }
  }

  private async ensurePayloadIndexes(): Promise<void> {
    const fields: Array<{ name: string; schema: 'keyword' }> = [
      { name: 'status', schema: 'keyword' },
      { name: 'categoryId', schema: 'keyword' },
      { name: 'tags', schema: 'keyword' },
    ];
    for (const { name, schema } of fields) {
      try {
        await this.client.createPayloadIndex(this.collectionName, {
          field_name: name,
          field_schema: schema,
        });
        this.logger.log(`Payload index created for "${name}"`);
      } catch (err) {
        this.logger.error(`Qdrant delete failed: ${(err as Error).message}`);
        throw new ServiceUnavailableException('Vector store is unavailable');
      }
    }
  }

  async upsertChunks(points: ChunkPoint[]): Promise<void> {
    if (points.length === 0) return;

    await this.client.upsert(this.collectionName, {
      wait: true,
      points: points.map((p) => ({
        id: p.id,
        vector: p.vector,
        payload: p.payload,
      })),
    });

    this.logger.log(`Upserted ${points.length} points`);
  }

  async deleteByArticleId(articleId: string): Promise<number> {
    const filter = {
      must: [{ key: 'articleId', match: { value: articleId } }],
    };

    try {
      const { count } = await this.client.count(this.collectionName, {
        filter,
      });
      if (count === 0) return 0;
      await this.client.delete(this.collectionName, { wait: true, filter });
      return count;
    } catch (err) {
      this.logger.error(`Qdrant delete failed: ${(err as Error).message}`);
      throw new ServiceUnavailableException('Vector store is unavailable');
    }
  }

  async search(
    vector: number[],
    opts: { limit: number; filters?: any },
  ): Promise<Array<{ score: number; payload: Record<string, unknown> }>> {
    try {
      const result = await this.client.search(this.collectionName, {
        vector,
        limit: opts.limit,
        filter: opts.filters,
        with_payload: true,
      });
      return result.map((r) => ({ score: r.score, payload: r.payload ?? {} }));
    } catch (err) {
      this.logger.error(`Qdrant search failed: ${(err as Error).message}`);
      throw new ServiceUnavailableException('Vector store is unavailable');
    }
  }
}
