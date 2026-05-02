import { IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TranslateArticleDto {
  @ApiProperty({
    description: 'Provide info about the target language',
    example: 'English',
  })
  @IsString()
  @IsNotEmpty()
  readonly targetLanguage: string;

  @ApiProperty({
    description: 'Provide info about the source language',
    example: 'Belarusian',
  })
  @IsOptional()
  @IsString()
  readonly sourceLanguage?: string;
}
