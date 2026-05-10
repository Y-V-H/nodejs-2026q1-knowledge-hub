export interface RagChatRequest {
  question: string;
  conversationId?: string;
}

export interface RagChatResponse {
  answer: string;
  sources: Array<{
    articleId: string;
    articleTitle: string;
    relevantChunk: string;
  }>;
  conversationId: string;
}
