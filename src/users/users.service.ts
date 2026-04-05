import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import type { SafeUser, User } from './interfaces/user.interface';
import { randomUUID } from 'crypto';
import { UserRole } from './enum/user-role.enum';
import { ArticleService } from '../articles/article.service';
import { CommentService } from '../comments/comment.service';
import { toSafeUser } from './utils/user.utils';

@Injectable()
export class UsersService {
  private users: User[] = [];

  constructor(
    private readonly articleService: ArticleService,
    private readonly commentService: CommentService,
  ) {}

  createUser(createUserDto: CreateUserDto): SafeUser {
    const newUser: User = {
      ...createUserDto,
      role: createUserDto.role ?? UserRole.VIEWER,
      id: randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.users.push(newUser);

    return toSafeUser(newUser);
  }

  getUser(id: string) {
    const user = this.users.find((user) => user.id === id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return toSafeUser(user);
  }

  getAllUsers() {
    const safeUsers = this.users.map((user) => toSafeUser(user));

    return safeUsers;
  }

  updateUser(id: string, updateUserDto: UpdateUserDto) {
    const index = this.users.findIndex((user) => user.id === id);
    if (index === -1) {
      throw new NotFoundException('User not found');
    }

    const oldPassword = this.users[index].password;
    if (oldPassword !== updateUserDto.oldPassword) {
      throw new ForbiddenException('Old password is not correct');
    }

    const user = this.users[index];
    user.password = updateUserDto.newPassword;
    user.updatedAt = Date.now();

    return toSafeUser(user);
  }

  deleteUser(id: string) {
    const index = this.users.findIndex((user) => user.id === id);
    if (index === -1) {
      throw new NotFoundException('User not found');
    }

    this.articleService.nullifyAuthorId(id);
    this.commentService.deleteCommentsByAuthorId(id);
    this.users.splice(index, 1);
  }
}
