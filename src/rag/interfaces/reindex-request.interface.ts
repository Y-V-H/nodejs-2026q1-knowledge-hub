export interface ReindexRequest {
  onlyPublished?: boolean;
  articleIds?: string[];
}

export interface ReindexResponse {
  indexedArticles: number;
  indexedChunks: number;
  vectorCollection: string;
}
