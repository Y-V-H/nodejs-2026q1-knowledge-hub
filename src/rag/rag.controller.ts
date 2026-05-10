import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RagService } from './rag.service';
import { RagChatRequestDto } from './dto/rag-chat-request.dto';
import { ReindexRequestDto } from './dto/reindex-request.dto';
import { RagSearchRequestDto } from './dto/rag-search-request.dto';

import type { ReindexResponse } from './interfaces/reindex-request.interface';
import type { RagSearchResponse } from './interfaces/rag-search-request.interface';
import type { RagChatResponse } from './interfaces/rag-chat-request.interface';

@ApiTags('RAG')
@ApiBearerAuth()
@Controller('ai/rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Post('index')
  @HttpCode(HttpStatus.OK)
  async reindex(
    @Body() reindexRequestDto: ReindexRequestDto,
  ): Promise<ReindexResponse> {
    return this.ragService.reindex(reindexRequestDto);
  }

  @Post('search')
  @HttpCode(HttpStatus.OK)
  async search(
    @Body() ragSearchRequestDto: RagSearchRequestDto,
  ): Promise<RagSearchResponse> {
    return this.ragService.search(ragSearchRequestDto);
  }

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  async chat(
    @Body() ragChatRequestDto: RagChatRequestDto,
  ): Promise<RagChatResponse> {
    return this.ragService.chat(ragChatRequestDto);
  }

  @Delete('index/articles/:articleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async indexArticles(@Param('articleId') articleId: string): Promise<void> {
    return this.ragService.removeArticleFromIndex(articleId);
  }

  @Get('chat/:conversationId/history')
  async getChatHistory(
    @Param('conversationId') conversationId: string,
  ): Promise<any> {
    return this.ragService.getChatHistory(conversationId);
  }
}
