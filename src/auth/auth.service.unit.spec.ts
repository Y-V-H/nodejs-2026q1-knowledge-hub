import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Role } from 'generated/prisma';

import { BadRequestException, ForbiddenException } from '@nestjs/common';

describe('Auth service', () => {
  let authService: AuthService;

  const mockJwtService = {
    signAsync: vi.fn(),
    verifyAsync: vi.fn(),
  };

  const mockConfigService = {
    get: vi.fn(),
  };
  const mockUsersService = {
    findByLogin: vi.fn(),
    updateRefreshToken: vi.fn(),
    createUser: vi.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    authService = moduleRef.get(AuthService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockUser = {
    id: 'd6808e4e-6165-467b-b85a-0cb5c04972d2',
    login: 'YY',
    refreshTokenHash: null,
    password: '123321',
    role: Role.VIEWER,
    createdAt: 1777049670678,
    updatedAt: 1777049670678,
  };

  const mockLoginDTO = {
    login: 'YY',
    password: '123321',
  };

  const mockRefreshTokenDTO = {
    refreshToken: 'refreshToken',
  };

  vi.mock('bcrypt', () => ({
    compare: vi.fn(),
    hash: vi.fn(),
  }));

  describe('signup', () => {
    test('should create a new user and return success message', async () => {
      mockUsersService.findByLogin.mockResolvedValue(null);
      mockConfigService.get.mockReturnValue('10');
      mockUsersService.createUser.mockResolvedValue(mockUser);

      const result = await authService.signup(mockLoginDTO);

      expect(mockUsersService.findByLogin).toHaveBeenCalledWith(
        mockLoginDTO.login,
      );
      const calledWith = mockUsersService.createUser.mock.calls[0][0];
      expect(calledWith.password).not.toBe(mockLoginDTO.password);

      expect(result.message).toBe(
        `Account created successfully for ${mockLoginDTO.login}`,
      );
    });
    test('should throw BadRequestException when login already exists', async () => {
      mockUsersService.findByLogin.mockResolvedValue(mockUser);

      await expect(authService.signup(mockLoginDTO)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('login', () => {
    test('should return accessToken and refreshToken', async () => {
      mockUsersService.findByLogin.mockResolvedValue(mockUser);
      mockConfigService.get.mockReturnValue('10');
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      (bcrypt.compare as any).mockResolvedValue(true);
      (bcrypt.hash as any).mockResolvedValue('hashed-refresh-token');
      const { accessToken, refreshToken } =
        await authService.login(mockLoginDTO);

      expect(accessToken).toBe('access-token');
      expect(refreshToken).toBe('refresh-token');
      expect(mockUsersService.updateRefreshToken).toHaveBeenCalledWith(
        mockUser.id,
        expect.any(String),
      );

      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({ sub: mockLoginDTO.login }),
        expect.objectContaining({ secret: expect.any(String) }),
      );
    });
    test('should throw ForbiddenException when user not found', async () => {
      mockUsersService.findByLogin.mockResolvedValue(null);

      await expect(authService.login(mockLoginDTO)).rejects.toThrow(
        ForbiddenException,
      );
    });
    test('should throw ForbiddenException when password is incorrect', async () => {
      mockUsersService.findByLogin.mockResolvedValue(mockUser);
      (bcrypt.compare as any).mockResolvedValue(false);

      await expect(authService.login(mockLoginDTO)).rejects.toThrow(
        ForbiddenException,
      );
    });
    test('should use VIEWER role as default when user role is null', async () => {
      mockUsersService.findByLogin.mockResolvedValue({
        ...mockUser,
        role: null,
      });
      (bcrypt.compare as any).mockResolvedValue(true);
      (bcrypt.hash as any).mockResolvedValue('hashed');
      mockConfigService.get.mockReturnValue('10');
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      await authService.login(mockLoginDTO);

      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({ role: Role.VIEWER }),
        expect.any(Object),
      );
    });
  });

  describe('refresh', () => {
    test('should return new accessToken and refreshToken', async () => {
      mockConfigService.get.mockReturnValue('10');
      mockJwtService.verifyAsync.mockResolvedValueOnce({
        sub: mockUser.login,
        userId: mockUser.id,
        role: mockUser.role,
      });
      mockJwtService.signAsync
        .mockResolvedValueOnce('newAccess-token')
        .mockResolvedValueOnce('newRefresh-token');

      const { accessToken, refreshToken } =
        await authService.refresh(mockRefreshTokenDTO);

      expect(mockJwtService.verifyAsync).toHaveBeenCalled();
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(
        mockRefreshTokenDTO.refreshToken,
        expect.objectContaining({ secret: expect.any(String) }),
      );
      expect(accessToken).toBe('newAccess-token');
      expect(refreshToken).toBe('newRefresh-token');
    });
    test('should throw ForbiddenException when token is invalid or expired', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(null);
      await expect(authService.refresh(mockRefreshTokenDTO)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
  describe('logout', () => {
    test('should clear refreshTokenHash and return success message', async () => {
      mockUsersService.updateRefreshToken.mockResolvedValue(null);

      const result = await authService.logout(mockUser.id);

      expect(mockUsersService.updateRefreshToken).toHaveBeenCalledWith(
        mockUser.id,
        null,
      );
      expect(result.message).toBe('Logged out successfully');
    });
  });

  describe('generateTokens', () => {
    test('should return accessToken and refreshToken', async () => {
      mockConfigService.get.mockReturnValue('10');
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const { accessToken, refreshToken } = await authService.generateTokens({
        login: mockUser.login,
        userId: mockUser.id,
        role: mockUser.role,
      });

      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(accessToken).toBe('access-token');
      expect(refreshToken).toBe('refresh-token');
    });
  });
});
