import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ description: 'Comment content', example: 'Great article!' })
  @IsString()
  @IsNotEmpty()
  readonly content: string;

  @ApiProperty({
    description: 'Article ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  readonly articleId: string;

  @ApiProperty({ description: 'Author ID', required: false })
  @IsOptional()
  @Transform(({ value }) => (value === null ? null : value))
  @IsUUID()
  readonly authorId?: string;
}
