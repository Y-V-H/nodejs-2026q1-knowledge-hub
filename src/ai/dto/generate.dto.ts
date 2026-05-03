import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateDto {
  @ApiProperty({
    description: 'Free-form prompt for the AI',
    example: 'Which camera better smena 8m or canon 5d?',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  readonly prompt: string;
}
