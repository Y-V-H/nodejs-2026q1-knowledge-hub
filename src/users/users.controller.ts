import {
  Body,
  Controller,
  Post,
  Get,
  Delete,
  Put,
  Param,
  ParseUUIDPipe,
  HttpCode,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { SafeUser } from './interfaces/user.interface';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'generated/prisma';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getAllUsers(): Promise<SafeUser[]> {
    return await this.usersService.getAllUsers();
  }

  @Get(':id')
  async findUser(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<SafeUser> {
    return await this.usersService.getUser(id);
  }

  @Put(':id')
  @Roles([Role.ADMIN])
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<SafeUser> {
    return await this.usersService.updateUser(id, updateUserDto);
  }

  @Post()
  @Roles([Role.ADMIN])
  async createUser(@Body() createUserDto: CreateUserDto): Promise<SafeUser> {
    return await this.usersService.createUser(createUserDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles([Role.ADMIN])
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.usersService.deleteUser(id);
  }
}
