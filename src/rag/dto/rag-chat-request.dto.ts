import { IsOptional, IsString, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RagChatRequestDto {
  @ApiProperty({
    description:
      'User question to be answered using the Knowledge Hub knowledge base. ' +
      'The system retrieves relevant article chunks and generates a grounded answer.',
    example: 'What does Elliott Erwitt say about candid photography?',
  })
  @IsString()
  @IsNotEmpty()
  readonly question: string;

  @ApiPropertyOptional({
    description:
      'Optional conversation ID to continue an existing chat. ' +
      'If omitted, a new conversation is started and its ID is returned in the response.',
    example: 'a3f1c2b4-89e0-4d7a-b1c2-9f8e7d6c5b4a',
  })
  @IsOptional()
  @IsUUID()
  readonly conversationId?: string;
}
