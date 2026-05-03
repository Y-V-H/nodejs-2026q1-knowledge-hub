import { Injectable } from '@nestjs/common';
import { GeminiUsageMetadata } from '../interfaces/gemini.interface';

export interface UsageStats {
  totalRequests: number;
  byEndpoint: Record<string, number>;
  tokens: {
    promptTokens: number;
    candidatesTokens: number;
    totalTokens: number;
  };
}

@Injectable()
export class AiUsageService {
  private totalRequests = 0;
  private byEndpoint: Record<string, number> = {};
  private promptTokens = 0;
  private candidatesTokens = 0;
  private totalTokens = 0;

  trackRequest(endpoint: string, tokens?: GeminiUsageMetadata): void {
    this.totalRequests += 1;
    this.byEndpoint[endpoint] = (this.byEndpoint[endpoint] ?? 0) + 1;

    if (tokens) {
      this.promptTokens += tokens.promptTokenCount ?? 0;
      this.candidatesTokens += tokens.candidatesTokenCount ?? 0;
      this.totalTokens += tokens.totalTokenCount ?? 0;
    }
  }

  getStats(): UsageStats {
    return {
      totalRequests: this.totalRequests,
      byEndpoint: { ...this.byEndpoint },
      tokens: {
        promptTokens: this.promptTokens,
        candidatesTokens: this.candidatesTokens,
        totalTokens: this.totalTokens,
      },
    };
  }
}
