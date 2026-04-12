import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.services';

@Module({
  imports: [],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
