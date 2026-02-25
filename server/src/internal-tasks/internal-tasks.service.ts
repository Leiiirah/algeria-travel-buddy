import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InternalTask, TaskStatus } from './entities/internal-task.entity';
import { CreateInternalTaskDto } from './dto/create-internal-task.dto';
import { UpdateInternalTaskDto } from './dto/update-internal-task.dto';
import { User, UserRole } from '../users/entities/user.entity';

export interface TaskStats {
  total: number;
  inProgress: number;
  completed: number;
  byEmployee: {
    employeeId: string;
    firstName: string;
    lastName: string;
    inProgress: number;
    completed: number;
  }[];
}

@Injectable()
export class InternalTasksService {
  constructor(
    @InjectRepository(InternalTask)
    private readonly taskRepository: Repository<InternalTask>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(user: User): Promise<InternalTask[]> {
    if (user.role === UserRole.ADMIN) {
      return this.taskRepository.find({
        order: { createdAt: 'DESC' },
        relations: ['assignee', 'creator'],
      });
    }
    
    // Employees only see their own tasks
    return this.taskRepository.find({
      where: { assignedTo: user.id },
      order: { createdAt: 'DESC' },
      relations: ['assignee', 'creator'],
    });
  }

  async findOne(id: string, user: User): Promise<InternalTask> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['assignee', 'creator'],
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    // Employees can only view their own tasks
    if (user.role !== UserRole.ADMIN && task.assignedTo !== user.id) {
      throw new ForbiddenException('You can only view tasks assigned to you');
    }

    return task;
  }

  async getStats(): Promise<TaskStats> {
    const tasks = await this.taskRepository.find({
      relations: ['assignee'],
    });

    const total = tasks.length;
    const inProgress = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
    const completed = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;

    // Group by employee
    const employeeMap = new Map<string, {
      firstName: string;
      lastName: string;
      inProgress: number;
      completed: number;
    }>();

    for (const task of tasks) {
      if (!task.assignee) continue;
      
      const key = task.assignedTo;
      const existing = employeeMap.get(key) || {
        firstName: task.assignee.firstName,
        lastName: task.assignee.lastName,
        inProgress: 0,
        completed: 0,
      };

      if (task.status === TaskStatus.IN_PROGRESS) {
        existing.inProgress++;
      } else {
        existing.completed++;
      }

      employeeMap.set(key, existing);
    }

    const byEmployee = Array.from(employeeMap.entries()).map(([employeeId, data]) => ({
      employeeId,
      ...data,
    }));

    return { total, inProgress, completed, byEmployee };
  }

  async create(dto: CreateInternalTaskDto, createdBy: string): Promise<InternalTask> {
    // Verify assignee exists
    const assignee = await this.userRepository.findOne({ where: { id: dto.assignedTo } });
    if (!assignee) {
      throw new NotFoundException(`User with ID ${dto.assignedTo} not found`);
    }

    const task = this.taskRepository.create({
      ...dto,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      createdBy,
    });

    return this.taskRepository.save(task);
  }

  async update(id: string, dto: UpdateInternalTaskDto, user: User): Promise<InternalTask> {
    const task = await this.findOne(id, user);

    // Employees can only update status
    if (user.role !== UserRole.ADMIN) {
      if (Object.keys(dto).some(key => key !== 'status')) {
        throw new ForbiddenException('You can only update the status of your tasks');
      }
    }

    // If assignedTo is being changed, verify new assignee exists
    if (dto.assignedTo && dto.assignedTo !== task.assignedTo) {
      const assignee = await this.userRepository.findOne({ where: { id: dto.assignedTo } });
      if (!assignee) {
        throw new NotFoundException(`User with ID ${dto.assignedTo} not found`);
      }
    }

    Object.assign(task, {
      ...dto,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : task.dueDate,
    });

    return this.taskRepository.save(task);
  }

  async getUnseenCount(userId: string): Promise<number> {
    return this.taskRepository.count({
      where: { assignedTo: userId, seen: false },
    });
  }

  async markAsSeen(userId: string): Promise<void> {
    await this.taskRepository.update(
      { assignedTo: userId, seen: false },
      { seen: true },
    );
  }

  async remove(id: string): Promise<void> {
    const task = await this.taskRepository.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    await this.taskRepository.remove(task);
  }
}
