import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { UserModule } from './users/users.modules';
import { ArticleModule } from './articles/article.module';
import { CategoryModule } from './categories/categories.module';
import { CommentModule } from './comments/comments.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { LoggerMiddleware } from './middleware/logging.middleware';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    UserModule,
    ArticleModule,
    CategoryModule,
    CommentModule,
    PrismaModule,
    AuthModule,
    AiModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
