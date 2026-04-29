import { describe, expect, test } from 'vitest';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateUserDto } from './create-user.dto';
import { Role } from '../../../generated/prisma';

describe('CreateUserDto', () => {
  const validDto = { login: 'Yoha Yohavich', password: 'password123' };

  test('should pass with valid data', async () => {
    const dto = plainToInstance(CreateUserDto, validDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  test('should fail when login is missing', async () => {
    const dto = plainToInstance(CreateUserDto, { password: 'password123' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'login')).toBe(true);
  });

  test('should fail when password is too short', async () => {
    const dto = plainToInstance(CreateUserDto, {
      login: 'Yoha',
      password: '123',
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  test('should fail when role is invalid enum value', async () => {
    const dto = plainToInstance(CreateUserDto, {
      ...validDto,
      role: 'superuser',
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'role')).toBe(true);
  });

  test('should pass with valid role', async () => {
    const dto = plainToInstance(CreateUserDto, {
      ...validDto,
      role: Role.ADMIN,
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});
