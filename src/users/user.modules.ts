import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UsersService } from './users.service';
import { ArticleModule } from '../articles/article.module';
import { CommentModule } from '../comments/comment.module';

@Module({
  imports: [ArticleModule, CommentModule],
  controllers: [UserController],
  providers: [UsersService],
})
export class UserModule {}
