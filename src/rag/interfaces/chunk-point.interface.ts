export interface ChunkPoint {
  id: string;
  vector: number[];
  payload: {
    articleId: string;
    articleTitle: string;
    chunkText: string;
    chunkIndex: number;
    status: string;
    categoryId?: string;
    tags?: string[];
  };
}
