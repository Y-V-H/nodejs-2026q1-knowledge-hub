import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Role } from 'generated/prisma';

const mockExecutionContext = (overrides: any = {}) => ({
  getHandler: vi.fn().mockReturnValue({}),
  getClass: vi.fn().mockReturnValue({}),
  switchToHttp: vi.fn().mockReturnValue({
    getRequest: vi.fn().mockReturnValue({
      headers: { authorization: 'Bearer valid-token' },
      user: null,
      ...overrides.request,
    }),
  }),
});

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let reflector: Reflector;

  const mockJwtService = { verifyAsync: vi.fn() };
  const mockConfigService = { get: vi.fn().mockReturnValue('secret') };
  const mockReflector = { getAllAndOverride: vi.fn() };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthGuard,
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: Reflector, useValue: mockReflector },
      ],
    }).compile();

    guard = moduleRef.get(AuthGuard);
    reflector = moduleRef.get(Reflector);
  });

  afterEach(() => vi.clearAllMocks());

  test('should allow access to public routes', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(true);
    const ctx = mockExecutionContext() as any;

    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
    expect(mockJwtService.verifyAsync).not.toHaveBeenCalled();
  });

  test('should allow access with valid token', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    mockJwtService.verifyAsync.mockResolvedValue({
      sub: 'user',
      userId: '123',
      role: Role.VIEWER,
    });
    const ctx = mockExecutionContext() as any;

    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
  });

  test('should throw UnauthorizedException when no token', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    const ctx = mockExecutionContext({ request: { headers: {} } }) as any;

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  test('should throw UnauthorizedException when token is malformed', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    const ctx = mockExecutionContext({
      request: { headers: { authorization: 'InvalidToken' } },
    }) as any;

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  test('should throw UnauthorizedException when token is expired', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    mockJwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));
    const ctx = mockExecutionContext() as any;

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });
});

describe('RolesGuard', () => {
  let guard: RolesGuard;
  const mockReflector = { get: vi.fn() };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [RolesGuard, { provide: Reflector, useValue: mockReflector }],
    }).compile();

    guard = moduleRef.get(RolesGuard);
  });

  afterEach(() => vi.clearAllMocks());

  test('should allow access when no roles metadata', () => {
    mockReflector.get.mockReturnValue(null);
    const ctx = mockExecutionContext({
      request: { user: { role: Role.VIEWER } },
    }) as any;

    expect(guard.canActivate(ctx)).toBe(true);
  });

  test('should allow access when user has correct role', () => {
    mockReflector.get.mockReturnValue([Role.ADMIN]);
    const ctx = mockExecutionContext({
      request: { user: { role: Role.ADMIN } },
    }) as any;

    expect(guard.canActivate(ctx)).toBe(true);
  });

  test('should deny access when user has insufficient role', () => {
    mockReflector.get.mockReturnValue([Role.ADMIN]);
    const ctx = mockExecutionContext({
      request: { user: { role: Role.VIEWER } },
    }) as any;

    expect(guard.canActivate(ctx)).toBe(false);
  });
});
