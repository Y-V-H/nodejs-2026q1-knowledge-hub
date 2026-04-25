import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ArticleService } from './article.service';
import { PrismaService } from '../prisma/prisma.service';
import { Test } from '@nestjs/testing';
import { Role, Status } from '../../generated/prisma';

describe('ArticleService', () => {
  let service: ArticleService;

  const mockPrismaService = {
    article: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };

  const mockArticle = {
    id: 'article-uuid-1234',
    title: 'Test Article',
    content: 'Test content',
    status: Status.DRAFT,
    categoryId: 'category-uuid-1234',
    authorId: 'author-uuid-1234',
    tags: [{ id: 'tag-uuid-1', name: 'nestjs' }],
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  const mockCreateDto = {
    title: 'Test Article',
    content: 'Test content',
    status: Status.DRAFT,
    categoryId: 'category-uuid-1234',
    authorId: 'author-uuid-1234',
    tags: ['nestjs'],
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ArticleService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = moduleRef.get(ArticleService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createArticle', () => {
    test('should create an article with tags', async () => {
      mockPrismaService.article.create.mockResolvedValue(mockArticle);

      const result = await service.createArticle(mockCreateDto);

      expect(mockPrismaService.article.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: mockCreateDto.title,
            status: Status.DRAFT,
          }),
        }),
      );
      expect(result.tags).toHaveLength(1);
      expect(result.title).toBe(mockArticle.title);
    });

    test('should create an article without tags when tags not provided', async () => {
      const dtoWithoutTags = { ...mockCreateDto, tags: undefined };
      mockPrismaService.article.create.mockResolvedValue({
        ...mockArticle,
        tags: [],
      });

      const result = await service.createArticle(dtoWithoutTags);

      expect(result.tags).toHaveLength(0);
    });
  });

  describe('getAllArticles', () => {
    test('should return all articles without filters', async () => {
      mockPrismaService.article.findMany.mockResolvedValue([mockArticle]);

      const result = await service.getAllArticles();

      expect(mockPrismaService.article.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
      expect(result).toHaveLength(1);
    });

    test('should filter by status', async () => {
      mockPrismaService.article.findMany.mockResolvedValue([mockArticle]);

      await service.getAllArticles('DRAFT');

      expect(mockPrismaService.article.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'DRAFT' },
        }),
      );
    });

    test('should filter by categoryId', async () => {
      mockPrismaService.article.findMany.mockResolvedValue([mockArticle]);

      await service.getAllArticles(undefined, 'category-uuid-1234');

      expect(mockPrismaService.article.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { categoryId: 'category-uuid-1234' },
        }),
      );
    });

    test('should filter by tag', async () => {
      mockPrismaService.article.findMany.mockResolvedValue([mockArticle]);

      await service.getAllArticles(undefined, undefined, 'nestjs');

      expect(mockPrismaService.article.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tags: { some: { name: 'nestjs' } } },
        }),
      );
    });
  });

  describe('getArticle', () => {
    test('should return article by id', async () => {
      mockPrismaService.article.findUnique.mockResolvedValue(mockArticle);

      const result = await service.getArticle(mockArticle.id);

      expect(result.id).toBe(mockArticle.id);
    });

    test('should throw NotFoundException when article not found', async () => {
      mockPrismaService.article.findUnique.mockResolvedValue(null);

      await expect(service.getArticle('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateArticle', () => {
    const updateProps = {
      id: mockArticle.id,
      updateArticleDto: { title: 'Updated Title', content: 'Updated content' },
      userId: 'author-uuid-1234',
      userRole: Role.EDITOR,
    };

    test('should update article when user is the author', async () => {
      mockPrismaService.article.findUnique.mockResolvedValue(mockArticle);
      mockPrismaService.article.update.mockResolvedValue({
        ...mockArticle,
        title: 'Updated Title',
      });

      const result = await service.updateArticle(updateProps);

      expect(result.title).toBe('Updated Title');
      expect(mockPrismaService.article.update).toHaveBeenCalled();
    });

    test('should update article when user is ADMIN', async () => {
      mockPrismaService.article.findUnique.mockResolvedValue(mockArticle);
      mockPrismaService.article.update.mockResolvedValue(mockArticle);

      await service.updateArticle({
        ...updateProps,
        userId: 'different-user-id',
        userRole: Role.ADMIN,
      });

      expect(mockPrismaService.article.update).toHaveBeenCalled();
    });

    test('should throw NotFoundException when article not found', async () => {
      mockPrismaService.article.findUnique.mockResolvedValue(null);

      await expect(service.updateArticle(updateProps)).rejects.toThrow(
        NotFoundException,
      );
    });

    test('should throw ForbiddenException when user is not the author', async () => {
      mockPrismaService.article.findUnique.mockResolvedValue(mockArticle);

      await expect(
        service.updateArticle({
          ...updateProps,
          userId: 'different-user-id',
          userRole: Role.EDITOR,
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    test('should update tags when tags provided', async () => {
      mockPrismaService.article.findUnique.mockResolvedValue(mockArticle);
      mockPrismaService.article.update.mockResolvedValue({
        ...mockArticle,
        tags: [{ id: 'tag-uuid-2', name: 'new-tag' }],
      });

      const result = await service.updateArticle({
        ...updateProps,
        updateArticleDto: { tags: ['new-tag'] },
      });

      expect(mockPrismaService.article.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tags: expect.objectContaining({ set: [] }),
          }),
        }),
      );
      expect(result.tags[0].name).toBe('new-tag');
    });
  });

  describe('deleteArticle', () => {
    test('should delete article', async () => {
      mockPrismaService.article.findUnique.mockResolvedValue(mockArticle);
      mockPrismaService.article.delete.mockResolvedValue(mockArticle);

      await service.deleteArticle(mockArticle.id);

      expect(mockPrismaService.article.delete).toHaveBeenCalledWith({
        where: { id: mockArticle.id },
      });
    });

    test('should throw NotFoundException when article not found', async () => {
      mockPrismaService.article.findUnique.mockResolvedValue(null);

      await expect(service.deleteArticle('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
