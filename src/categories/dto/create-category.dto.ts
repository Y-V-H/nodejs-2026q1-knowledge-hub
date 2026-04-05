import { IsString, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Category name (unique identifier for the category)',
    example: 'Technology',
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  readonly name: string;

  @ApiProperty({
    description: 'Detailed description of the category',
    example: 'Software development',
  })
  @IsString()
  @IsNotEmpty()
  readonly description: string;
}
