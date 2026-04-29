import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    description: 'The old password of the user (min 5 characters)',
    example: 'password123',
  })
  @IsString()
  oldPassword: string;

  @ApiProperty({
    description: 'The new password of the user (min 5 characters)',
    example: 'password333',
  })
  @IsString()
  newPassword: string;
}
