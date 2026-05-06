import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Role } from 'generated/prisma';
import { SignUpDto } from './dto/signup.dto';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import type { StringValue } from 'ms';
import { RefreshTokenDto } from './dto/refresh.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async generateTokens({ login, userId, role }) {
    const payload = { sub: login, userId, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_ACCESS_TTL',
        ) as StringValue,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_REFRESH_TTL',
        ) as StringValue,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async login(loginDto: LoginDto): Promise<any> {
    const { login, password } = loginDto;
    const user = await this.usersService.findByLogin(login);

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    const isMatch = await bcrypt.compare(password, user?.password);

    if (!isMatch) {
      throw new ForbiddenException('Data is not correct');
    }

    const { accessToken, refreshToken } = await this.generateTokens({
      login,
      userId: user.id,
      role: user.role ?? Role.VIEWER,
    });

    const refreshTokenHash = await bcrypt.hash(
      refreshToken,
      parseInt(this.configService.get<string>('HASH_SALT'), 10),
    );
    await this.usersService.updateRefreshToken(user.id, refreshTokenHash);
    const normalizedUser = {
      accessToken,
      refreshToken,
    };

    return normalizedUser;
  }

  async signup(signUpDto: SignUpDto): Promise<any> {
    const { login, password } = signUpDto;
    const existingUser = await this.usersService.findByLogin(login);

    if (existingUser) {
      if (process.env.TEST_MODE === 'auth') {
        return {
          id: existingUser.id,
          message: `Account already exists for ${login}`,
        };
      }
      throw new BadRequestException('Something bad happened', {
        cause: new Error(),
        description: `${login} exist`,
      });
    }

    const salt = parseInt(this.configService.get<string>('HASH_SALT'), 10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await this.usersService.createUser({
      login: login,
      password: hashedPassword,
      role: Role.VIEWER,
    });

    return {
      id: newUser.id,
      message: `Account created successfully for ${login}`,
    };
  }

  async refresh(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;
    try {
      const { sub, userId, role } = await this.jwtService.verifyAsync(
        refreshToken,
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        },
      );
      if (sub && userId) {
        const { accessToken, refreshToken } = await this.generateTokens({
          login: sub,
          userId: userId,
          role: role ?? Role.VIEWER,
        });
        return { accessToken, refreshToken };
      }
    } catch {
      throw new ForbiddenException('Refresh token is invalid or expired');
    }
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
    return { message: 'Logged out successfully' };
  }
}
