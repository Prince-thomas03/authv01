import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { getQuadrant } from './utils/quadrant';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: CreateTaskDto) {
    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        isUrgent: dto.isUrgent ?? false,
        isImportant: dto.isImportant ?? false,
        status: dto.status ?? 'todo',
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        userId,
      },
    });

    return this.withQuadrant(task);
  }

  async findAll(userId: number) {
    const tasks = await this.prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return tasks.map((task) => this.withQuadrant(task));
  }

  async findOne(userId: number, id: number) {
    const task = await this.findOwnedOrThrow(userId, id);
    return this.withQuadrant(task);
  }

  async update(userId: number, id: number, dto: UpdateTaskDto) {
    await this.findOwnedOrThrow(userId, id);

    const task = await this.prisma.task.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        isUrgent: dto.isUrgent,
        isImportant: dto.isImportant,
        status: dto.status,
        dueDate:
          dto.dueDate === undefined
            ? undefined
            : dto.dueDate === null
              ? null
              : new Date(dto.dueDate),
      },
    });

    return this.withQuadrant(task);
  }

  async remove(userId: number, id: number) {
    await this.findOwnedOrThrow(userId, id);
    await this.prisma.task.delete({ where: { id } });
    return { message: 'Task deleted' };
  }

  private async findOwnedOrThrow(userId: number, id: number) {
    const task = await this.prisma.task.findFirst({
      where: { id, userId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  private withQuadrant<T extends { isUrgent: boolean; isImportant: boolean }>(
    task: T,
  ) {
    return {
      ...task,
      quadrant: getQuadrant(task.isUrgent, task.isImportant),
    };
  }
}
