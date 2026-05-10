import { Status } from '../../../generated/prisma';

export interface RagSearchRequest {
  query: string;
  limit?: number;
  articleStatus?: Status;
  categoryId?: string;
  tags?: string[];
}

export interface RagSearchResponse {
  results: Array<{
    articleId: string;
    articleTitle: string;
    chunk: string;
    similarity: number;
  }>;
}
