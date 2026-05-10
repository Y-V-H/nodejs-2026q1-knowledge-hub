import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  GeminiResponse,
  GeminiGenerateResult,
} from '../interfaces/gemini.interface';
import { AxiosError } from 'axios';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly model: string;
  private readonly MAX_RETRIES = 3;
  private readonly embedModel: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.apiUrl = this.configService.get<string>('GEMINI_API_BASE_URL');
    this.model = this.configService.get<string>('GEMINI_MODEL');
    this.embedModel = this.configService.getOrThrow<string>(
      'GEMINI_EMBEDDING_MODEL',
    );
  }

  async generate(prompt: string): Promise<GeminiGenerateResult> {
    const url = `${this.apiUrl}/v1beta/models/${this.model}:generateContent`;
    const headersRequest = {
      'x-goog-api-key': this.apiKey,
    };
    const body = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    };

    const response = await this.requestWithRetry<GeminiResponse>(url, body);
    return {
      text: response.candidates[0].content.parts[0].text,
      usageMetadata: response.usageMetadata,
    };
  }

  async embedContent(
    text: string,
    taskType: 'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY',
  ): Promise<number[]> {
    const url = `${this.apiUrl}/v1beta/models/${this.embedModel}:embedContent`;
    const body = {
      content: { parts: [{ text }] },
      taskType,
      outputDimensionality: 768,
    };
    const data = await this.requestWithRetry<{
      embedding: { values: number[] };
    }>(url, body);
    return data.embedding.values;
  }

  async batchEmbedContents(texts: string[], taskType): Promise<number[][]> {
    if (texts.length === 0) return [];

    const url = `${this.apiUrl}/v1beta/models/${this.embedModel}:batchEmbedContents`;

    const body = {
      requests: texts.map((text) => ({
        model: `models/${this.embedModel}`,
        content: { parts: [{ text }] },
        taskType,
        outputDimensionality: 768,
      })),
    };

    console.log('URL:', url);
    console.log('Body:', JSON.stringify(body, null, 2));
    const data = await this.requestWithRetry<{
      embeddings: { values: number[] }[];
    }>(url, body);
    return data.embeddings.map((e) => e.values);
  }

  private async requestWithRetry<T>(url: string, body: unknown): Promise<T> {
    const headers = { 'x-goog-api-key': this.apiKey };

    for (let attempt = 0; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const response = await firstValueFrom(
          this.httpService.post<T>(url, body, { headers, timeout: 30000 }),
        );
        return response.data;
      } catch (error) {
        const axiosError = error as AxiosError;
        const status = axiosError.response?.status;

        if (status === 401 || status === 403) {
          this.logger.error(`Gemini auth error: ${status}`);
          throw new InternalServerErrorException(
            'AI service configuration error',
          );
        }

        const isRetryable =
          status === 429 || (status && status >= 500) || !status;

        if (isRetryable && attempt < this.MAX_RETRIES) {
          const delayMs = 1000 * Math.pow(2, attempt);
          this.logger.warn(
            `Gemini request failed (status: ${status ?? 'network'}), retrying in ${delayMs}ms (attempt ${attempt + 1}/${this.MAX_RETRIES})`,
          );
          await this.sleep(delayMs);
          continue;
        }

        this.logger.error(
          `Gemini request failed after ${attempt} attempts: ${axiosError.message}`,
        );
        throw new ServiceUnavailableException(
          'AI service is currently unavailable',
        );
      }
    }
    throw new ServiceUnavailableException(
      'AI service is currently unavailable',
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
