export interface SummarizeArticleRequest {
  maxLength?: 'short' | 'medium' | 'detailed';
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

export interface AnalyzeArticleRequest {
  task?: 'review' | 'bugs' | 'optimize' | 'explain';
}

export interface AnalyzeArticleResponse {
  articleId: string;
  analysis: string;
  suggestions: string[];
  severity: 'info' | 'warning' | 'error';
}