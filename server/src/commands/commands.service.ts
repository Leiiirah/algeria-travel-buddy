import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { Command, CommandStatus } from './entities/command.entity';
import { CreateCommandDto } from './dto/create-command.dto';
import { UpdateCommandDto } from './dto/update-command.dto';

export interface CommandFilters {
  status?: string;
  serviceId?: string;
  supplierId?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
  createdBy?: string; // Filter by creator (for employee access)
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class CommandsService {
  constructor(
    @InjectRepository(Command)
    private commandsRepository: Repository<Command>,
  ) {}

  async findAll(filters: CommandFilters = {}): Promise<PaginatedResponse<Command>> {
    const {
      status,
      serviceId,
      supplierId,
      search,
      fromDate,
      toDate,
      page = 1,
      limit = 20,
      createdBy,
    } = filters;

    const queryBuilder = this.commandsRepository
      .createQueryBuilder('command')
      .leftJoinAndSelect('command.service', 'service')
      .leftJoinAndSelect('command.supplier', 'supplier')
      .leftJoinAndSelect('command.creator', 'creator')
      .leftJoinAndSelect('command.assignee', 'assignee');

    if (status) {
      queryBuilder.andWhere('command.status = :status', { status });
    }

    if (serviceId) {
      queryBuilder.andWhere('command.serviceId = :serviceId', { serviceId });
    }

    if (supplierId) {
      queryBuilder.andWhere('command.supplierId = :supplierId', { supplierId });
    }

    if (search) {
      queryBuilder.andWhere(
        "(command.data->>'clientFullName' ILIKE :search OR command.destination ILIKE :search)",
        { search: `%${search}%` },
      );
    }

    if (fromDate) {
      queryBuilder.andWhere('COALESCE(command.commandDate, command.createdAt) >= :fromDate', {
        fromDate: new Date(fromDate),
      });
    }

    if (toDate) {
      queryBuilder.andWhere('COALESCE(command.commandDate, command.createdAt) <= :toDate', {
        toDate: new Date(toDate),
      });
    }

    // Filter by creator OR assignedTo (for employee access control)
    if (createdBy) {
      queryBuilder.andWhere(
        '(command.createdBy = :userId OR command.assignedTo = :userId)',
        { userId: createdBy },
      );
    }

    const total = await queryBuilder.getCount();
    const skip = (page - 1) * limit;

    const data = await queryBuilder
      .orderBy('COALESCE(command.commandDate, command.createdAt)', 'DESC')
      .skip(skip)
      .take(limit)
      .getMany();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Command> {
    const command = await this.commandsRepository.findOne({
      where: { id },
      relations: ['service', 'supplier', 'creator', 'assignee'],
    });
    if (!command) {
      throw new NotFoundException(`Command with ID ${id} not found`);
    }
    return command;
  }

  async getStats(userId?: string) {
    const queryBuilder = this.commandsRepository.createQueryBuilder('command');
    if (userId) {
      queryBuilder.where(
        '(command.createdBy = :userId OR command.assignedTo = :userId)',
        { userId },
      );
    }
    const commands = await queryBuilder.getMany();

    const totalPaid = commands.reduce(
      (sum, cmd) => sum + Number(cmd.amountPaid || 0),
      0,
    );
    const totalRemaining = commands.reduce(
      (sum, cmd) => sum + (Number(cmd.sellingPrice || 0) - Number(cmd.amountPaid || 0)),
      0,
    );
    const totalProfit = commands.reduce(
      (sum, cmd) => sum + (Number(cmd.sellingPrice || 0) - Number(cmd.buyingPrice || 0)),
      0,
    );

    const byStatus = {
      dossier_incomplet: 0,
      depose: 0,
      en_traitement: 0,
      accepte: 0,
      refuse: 0,
      visa_delivre: 0,
      retire: 0,
    };

    commands.forEach((cmd) => {
      if (byStatus[cmd.status] !== undefined) {
        byStatus[cmd.status]++;
      }
    });

    return { totalPaid, totalRemaining, totalProfit, byStatus };
  }

  async create(createCommandDto: CreateCommandDto, userId: string): Promise<Command> {
    const command = this.commandsRepository.create({
      ...createCommandDto,
      createdBy: userId,
    });
    return this.commandsRepository.save(command);
  }

  async update(id: string, updateCommandDto: UpdateCommandDto): Promise<Command> {
    const command = await this.findOne(id);
    Object.assign(command, updateCommandDto);
    return this.commandsRepository.save(command);
  }

  async updateStatus(id: string, status: string): Promise<Command> {
    const command = await this.findOne(id);
    command.status = status as CommandStatus;
    return this.commandsRepository.save(command);
  }

  async updateAmountPaid(id: string, amountPaid: number): Promise<Command> {
    const command = await this.findOne(id);
    command.amountPaid = amountPaid;
    return this.commandsRepository.save(command);
  }

  async remove(id: string): Promise<void> {
    const command = await this.findOne(id);
    await this.commandsRepository.remove(command);
  }
}
