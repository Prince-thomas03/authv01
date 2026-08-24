import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

type AuthRequest = {
  user: { id: number; name: string; email: string };
};

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Request() req: AuthRequest, @Body() dto: CreateTaskDto) {
    return this.tasksService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Request() req: AuthRequest) {
    return this.tasksService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Request() req: AuthRequest, @Param('id', ParseIntPipe) id: number) {
    return this.tasksService.findOne(req.user.id, id);
  }

  @Patch(':id')
  update(
    @Request() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(req.user.id, id, dto);
  }

  @Delete(':id')
  remove(@Request() req: AuthRequest, @Param('id', ParseIntPipe) id: number) {
    return this.tasksService.remove(req.user.id, id);
  }
}
