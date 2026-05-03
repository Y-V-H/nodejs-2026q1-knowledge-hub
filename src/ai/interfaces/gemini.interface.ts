interface ContentPart {
  text: string;
}
interface GeminiResponseCandidate {
  content: {
    parts: ContentPart[];
    role: string;
  };
  finishReason: string;
  index: number;
}
export interface GeminiUsageMetadata {
  promptTokenCount: number;
  candidatesTokenCount: number;
  totalTokenCount: number;
}
export interface GeminiResponse {
  candidates: GeminiResponseCandidate[];
  usageMetadata?: GeminiUsageMetadata;
}

export interface GeminiGenerateResult {
  text: string;
  usageMetadata?: GeminiUsageMetadata;
}
