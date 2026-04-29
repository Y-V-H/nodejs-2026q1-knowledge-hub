import { describe, expect, test } from 'vitest';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { Role } from '../../../generated/prisma';
import { SignUpDto } from './signup.dto';
import { LoginDto } from './login.dto';
import { RefreshTokenDto } from './refresh.dto';

describe('Login Refresh SignUp DTO', () => {
  const validDto = { login: 'Yoha Yohavich', password: 'password123' };
  const refreshTokenDTO = { refreshToken: 'refreshToken' };

  test('should create a new user with valid data', async () => {
    const dto = plainToInstance(SignUpDto, validDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  test('should fail when login is missing', async () => {
    const dto = plainToInstance(SignUpDto, { password: 'password123' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'login')).toBe(true);
  });

  test('should login a user with valid data', async () => {
    const dto = plainToInstance(LoginDto, validDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  test('should fail when login is missing for LoginDto', async () => {
    const dto = plainToInstance(LoginDto, { password: 'password123' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'login')).toBe(true);
  });

  test('should provide new refreshToken', async () => {
    const dto = plainToInstance(RefreshTokenDto, refreshTokenDTO);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  test('should fail when refreshToken is not correct', async () => {
    const dto = plainToInstance(RefreshTokenDto, {
      refreshToken: null,
    });
    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'refreshToken')).toBe(true);
  });
});
