export type SummaryLength = 'short' | 'medium' | 'detailed';
export interface SummarizeArticleRequest {
  maxLength?: SummaryLength;
}

export interface SummarizeArticleResponse {
  articleId: string;
  summary: string;
  originalLength: number;
  summaryLength: number;
}

export interface TranslateArticleRequest {
  targetLanguage: string;
  sourceLanguage?: string;
}

export interface TranslateArticleResponse {
  articleId: string;
  translatedText: string;
  detectedLanguage: string;
}

export type AnalyzeArticleSeverity = 'info' | 'warning' | 'error';
export type AnalyzeArticleType = 'review' | 'bugs' | 'optimize' | 'explain';
export interface AnalyzeArticleRequest {
  task?: AnalyzeArticleType;
}

export interface AnalyzeArticleResponse {
  articleId: string;
  analysis: string;
  suggestions: string[];
  severity: AnalyzeArticleSeverity;
}
