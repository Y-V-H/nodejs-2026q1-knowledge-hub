import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import {
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { Test } from '@nestjs/testing';
import { Role } from '../../generated/prisma';

describe('UsersService', () => {
  let service: UsersService;
  let mockPrismaService = {
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    comment: {
      deleteMany: vi.fn(),
    },
    article: {
      updateMany: vi.fn(),
    },
    $transaction: vi.fn(),
  };
  const mockUser = {
    id: 'd6808e4e-6165-467b-b85a-0cb5c04972d2',
    login: 'YY',
    refreshTokenHash: null,
    password: '123321',
    role: Role.VIEWER,
    createdAt: 1777049670678,
    updatedAt: 1777049670678,
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = moduleRef.get(UsersService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createUser', () => {
    test('should create a new user', async () => {
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const user = await service.createUser({
        login: 'YY',
        password: '123321',
      });

      expect(user).toMatchObject({
        id: mockUser.id,
        login: mockUser.login,
        role: 'viewer',
        createdAt: 1777049670678,
        updatedAt: 1777049670678,
      });
      expect(user).not.toHaveProperty('password');
      expect(user).not.toHaveProperty('refreshTokenHash');
    });

    test('should throw ConflictException when such user exist', async () => {
      mockPrismaService.user.create.mockRejectedValue({ code: 'P2002' });

      await expect(
        service.createUser({
          login: 'YY',
          password: '123321',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('getUser', () => {
    test('should get an user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      const user = await service.getUser(mockUser.id);
      expect(user).toMatchObject({
        id: mockUser.id,
        login: mockUser.login,
        role: 'viewer',
        createdAt: 1777049670678,
        updatedAt: 1777049670678,
      });
      expect(user).not.toHaveProperty('password');
      expect(user).not.toHaveProperty('refreshTokenHash');
    });
    test('should throw NotFoundException when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getUser(mockUser.id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAllUsers', () => {
    test('should return all users', async () => {
      const mockUsers = [
        mockUser,
        {
          ...mockUser,
          id: '54c60894-341b-4c0f-9fa3-7c2ceb6f1bde',
          login: 'TT',
        },
      ];
      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);
      const users = await service.getAllUsers();
      expect(users.length).toBe(2);
      expect(users[0]).toMatchObject({
        login: mockUser.login,
        id: mockUser.id,
        role: 'viewer',
      });

      users.forEach((user) => {
        expect(user).not.toHaveProperty('password');
        expect(user).not.toHaveProperty('refreshTokenHash');
      });
    });
  });

  describe('updateUser', () => {
    const mockDTO = {
      oldPassword: '123321',
      newPassword: 'asddsa',
    };
    test('should update the user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        password: mockDTO.newPassword,
      });

      const updatedUser = await service.updateUser(mockUser.id, mockDTO);
      expect(updatedUser).toMatchObject({
        login: mockUser.login,
        id: mockUser.id,
      });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { password: mockDTO.newPassword },
      });
    });
    test('should throw NotFoundException when the user did not find', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.updateUser(mockUser.id, mockDTO)).rejects.toThrow(
        NotFoundException,
      );
    });
    test('should throw ForbiddenException when the old password was not correct', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.updateUser(mockUser.id, { ...mockDTO, oldPassword: '123333' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteUser', () => {
    test('should throw NotFoundException when the user was not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.deleteUser(mockUser.id)).rejects.toThrow(
        NotFoundException,
      );
    });
    test('should delete user and all articles and comments', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.comment.deleteMany.mockResolvedValue({ count: 1 });
      mockPrismaService.article.updateMany.mockResolvedValue({ count: 1 });
      mockPrismaService.user.delete.mockResolvedValue(mockUser);
      mockPrismaService.$transaction.mockImplementation((promises) =>
        Promise.all(promises),
      );

      await service.deleteUser(mockUser.id);

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(mockPrismaService.comment.deleteMany).toHaveBeenCalledWith({
        where: { authorId: mockUser.id },
      });
      expect(mockPrismaService.article.updateMany).toHaveBeenCalledWith({
        where: { authorId: mockUser.id },
        data: { authorId: null },
      });
      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
    });
  });

  describe('updateRefreshToken', () => {
    test('should update token for the user', async () => {
      const updatedUser = { ...mockUser, refreshTokenHash: 'someHash' };
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.updateRefreshToken(mockUser.id, 'someHash');

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { refreshTokenHash: 'someHash' },
      });
      expect(result.refreshTokenHash).toBe('someHash');
    });
  });

  describe('findByLogin', () => {
    test('should return user by login', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      await service.findByLogin(mockUser.login);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { login: mockUser.login },
      });
    });
  });
});
