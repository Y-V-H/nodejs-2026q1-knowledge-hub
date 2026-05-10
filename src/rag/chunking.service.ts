import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ChunkingService {
  private readonly chunkSize: number;
  private readonly chunkOverlap: number;

  constructor(config: ConfigService) {
    this.chunkSize = Number(config.get('RAG_CHUNK_SIZE', 800));
    this.chunkOverlap = Number(config.get('RAG_CHUNK_OVERLAP', 200));
  }

  split(text: string): string[] {
    if (!text) return [];
    if (text.length <= this.chunkSize) return [text];

    const chunks: string[] = [];
    const step = this.chunkSize - this.chunkOverlap;

    for (let start = 0; start < text.length; start += step) {
      const end = Math.min(start + this.chunkSize, text.length);
      chunks.push(text.slice(start, end));
      if (end >= text.length) break;
    }
    return chunks;
  }
}
