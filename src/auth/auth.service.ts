import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.interface';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
    });

    return this.toPublicUser(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueTokens(user);
  }

  async refresh(dto: RefreshDto) {
    const user = await this.usersService.findByRefreshToken(dto.refresh_token);
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.issueTokens(user);
  }

  async logout(dto: RefreshDto) {
    const user = await this.usersService.findByRefreshToken(dto.refresh_token);
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.usersService.clearRefreshToken(user.id);
    return { message: 'Logged out' };
  }

  private async issueTokens(user: User) {
    const access_token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    const refresh_token = randomBytes(32).toString('hex');
    const refreshTokenHash = await bcrypt.hash(refresh_token, 10);
    await this.usersService.saveRefreshToken(user.id, refreshTokenHash);

    return {
      access_token,
      refresh_token,
      user: this.toPublicUser(user),
    };
  }

  private toPublicUser(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }
}
