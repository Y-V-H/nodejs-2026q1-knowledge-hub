import { Module } from '@nestjs/common';
import { UserModule } from './users/user.modules';
import { ArticleModule } from './articles/article.module';
import { CategoryModule } from './categories/category.modules';
import { CommentModule } from './comments/comment.module';

@Module({
  imports: [UserModule, ArticleModule, CategoryModule, CommentModule],
})
export class AppModule {}
