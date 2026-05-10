import { Injectable } from '@nestjs/common';
import { GeminiService } from 'src/ai/services/gemini.service';

@Injectable()
export class EmbeddingService {
  constructor(private readonly gemini: GeminiService) {}

  async embedDocuments(texts: string[]): Promise<number[][]> {
    return this.gemini.batchEmbedContents(texts, 'RETRIEVAL_DOCUMENT');
  }

  async embedQuery(text: string): Promise<number[]> {
    return this.gemini.embedContent(text, 'RETRIEVAL_QUERY');
  }
}
