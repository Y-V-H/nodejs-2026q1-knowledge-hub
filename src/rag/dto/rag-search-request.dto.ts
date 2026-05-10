import {
  IsOptional,
  IsArray,
  IsString,
  IsInt,
  IsEnum,
  IsNotEmpty,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Status } from '../../../generated/prisma';

export class RagSearchRequestDto {
  @ApiProperty({
    description: 'Search query',
    example: 'How is Elliott Erwitt',
  })
  @IsString()
  @IsNotEmpty()
  readonly query: string;

  @ApiPropertyOptional({
    description: 'Number of results to return',
    example: 5,
    default: 5,
    minimum: 1,
    maximum: 20,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  readonly limit?: number;

  @ApiPropertyOptional({
    description: 'Filter chunks by article status',
    enum: Status,
    example: Status.PUBLISHED,
  })
  @IsOptional()
  @IsEnum(Status)
  readonly articleStatus?: Status;

  @ApiPropertyOptional({
    description: 'Filter chunks by category ID',
    example: 'a3f1c2b4-...',
  })
  @IsOptional()
  @IsString()
  readonly categoryId?: string;

  @ApiPropertyOptional({
    description: 'Filter chunks by tags (any match)',
    example: ['photography', 'analysis'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly tags?: string[];
}
