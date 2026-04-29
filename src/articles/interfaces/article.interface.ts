import { Status } from '../../../generated/prisma';
import { Tag } from '../../../generated/prisma';

export interface Article {
  id: string; // uuid
  title: string;
  content: string;
  status: Status;
  authorId?: string | null;
  categoryId?: string | null; // uuid
  tags: Tag[];
  createdAt: Date;
  updatedAt: Date;
}
