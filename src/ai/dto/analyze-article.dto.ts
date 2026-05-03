import { IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AnalyzeArticleType } from '../interfaces/ai.interface';

export class AnalyzeArticleContentDto {
  @ApiProperty({
    description: 'Task description',
    example: 'review | bugs | optimize | explain',
  })
  @IsOptional()
  @IsIn(['review', 'bugs', 'optimize', 'explain'])
  readonly task?: AnalyzeArticleType;
}
