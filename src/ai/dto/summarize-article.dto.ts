import { IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SummaryLength } from '../interfaces/ai.interface';

export class SummarizeArticleDto {
  @ApiProperty({
    description: 'maxLength',
    example: 'short | medium | detailed',
  })
  @IsOptional()
  @IsIn(['short', 'medium', 'detailed'])
  readonly maxLength?: SummaryLength;
}
