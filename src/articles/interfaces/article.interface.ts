import { ArticleStatus } from '../enum/article-status.enum';

export interface Article {
  id: string; // uuid
  title: string;
  content: string;
  status: ArticleStatus;
  authorId?: string | null;
  categoryId?: string | null; // uuid
  tags: string[];
  createdAt: number;
  updatedAt: number;
}
