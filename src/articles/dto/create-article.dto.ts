import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsUUID,
  IsArray,
  IsOptional,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Status } from '../../../generated/prisma';

export class CreateArticleDto {
  @ApiProperty({
    description: 'The title of the article',
    example: 'Introduction to NestJS',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  readonly title: string;

  @ApiProperty({
    description: 'Main text content of the article',
    example: 'NestJS is a progressive Node.js framework ...',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  readonly content: string;

  @ApiProperty({
    description: 'Current publication status of the article',
    example: Status.PUBLISHED,
    enum: Status,
    default: Status.DRAFT,
    required: false,
  })
  @IsOptional()
  @IsEnum(Status)
  @Transform(({ value }) => value?.toUpperCase())
  readonly status?: Status;

  @ApiProperty({
    description: 'Unique identifier of the associated category',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  @Transform(({ value }) => value ?? undefined)
  readonly categoryId?: string;

  @ApiProperty({
    description: 'Unique identifier of the author',
    example: '550e8400-e29b-41d4-a716-446655440001',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  @Transform(({ value }) => value ?? undefined)
  readonly authorId: string;

  @ApiProperty({
    description: 'List of tags for article categorization and search',
    example: ['nestjs', 'backend', 'tutorial'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly tags?: string[];
}
