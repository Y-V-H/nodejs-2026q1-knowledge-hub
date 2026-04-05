import { IsString, IsNotEmpty, MinLength, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../enum/user-role.enum';

export class CreateUserDto {
  @ApiProperty({
    description: 'The user login',
    example: 'John_Doe',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  readonly login: string;

  @ApiProperty({
    description: 'The password of the user (min 5 characters)',
    example: 'password123',
  })
  @IsString()
  @MinLength(5)
  readonly password: string;

  @ApiProperty({
    description: 'The user role',
    example: 'admin',
  })
  @IsString()
  @IsEnum(UserRole)
  role?: UserRole;
}
