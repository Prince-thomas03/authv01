import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { User } from './user.interface';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByRefreshToken(refreshToken: string): Promise<User | null> {
    const users = await this.prisma.user.findMany({
      where: { refreshTokenHash: { not: null } },
    });

    console.log(users);
    

    for (const user of users) {
      if (!user.refreshTokenHash) {
        continue;
      }

      const matches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
      if (matches) {
        return user;
      }
    }

    return null;
  }

  create(data: Omit<User, 'id'>): Promise<User> {
    return this.prisma.user.create({ data });
  }

  saveRefreshToken(userId: number, refreshTokenHash: string): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash },
    });
  }

  clearRefreshToken(userId: number): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
    });
  }
}
