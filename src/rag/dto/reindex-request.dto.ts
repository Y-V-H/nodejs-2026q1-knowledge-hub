import { IsOptional, IsArray, IsString, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ReindexRequestDto {
  @ApiPropertyOptional({
    description:
      'If true, only published articles are indexed. Defaults to true.',
    example: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  readonly onlyPublished?: boolean;

  @ApiPropertyOptional({
    description:
      'Optional list of article IDs for selective reindex. If omitted, all articles matching the filters are processed.',
    example: ['a3f1c2b4-...', 'b7e2d3c5-...'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  articleIds?: string[];
}
