import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  GeminiResponse,
  GeminiGenerateResult,
} from '../interfaces/gemini.interface';

@Injectable()
export class GeminiService {
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly model: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.apiUrl = this.configService.get<string>('GEMINI_API_BASE_URL');
    this.model = this.configService.get<string>('GEMINI_MODEL');
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

    try {
      const response = await firstValueFrom(
        this.httpService.post<GeminiResponse>(url, body, {
          headers: headersRequest,
        }),
      );

      return {
        text: response.data.candidates[0].content.parts[0].text,
        usageMetadata: response.data?.usageMetadata,
      };
    } catch (error) {
      throw new Error(`something went wrong - ${error}`);
    }
  }
}
