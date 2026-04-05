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

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getAllUsers(): SafeUser[] {
    return this.usersService.getAllUsers();
  }

  @Get(':id')
  findUser(@Param('id', new ParseUUIDPipe()) id: string): SafeUser {
    return this.usersService.getUser(id);
  }

  @Put(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): SafeUser {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @Post()
  createUser(@Body() createUserDto: CreateUserDto): SafeUser {
    return this.usersService.createUser(createUserDto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.usersService.deleteUser(id);
  }
}
