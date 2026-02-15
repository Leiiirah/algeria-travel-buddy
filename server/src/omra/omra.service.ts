import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OmraHotel } from './entities/omra-hotel.entity';
import { OmraOrder, OmraStatus } from './entities/omra-order.entity';
import { OmraVisa } from './entities/omra-visa.entity';
import { OmraProgram } from './entities/omra-program.entity';
import { CreateOmraHotelDto } from './dto/create-omra-hotel.dto';
import { UpdateOmraHotelDto } from './dto/update-omra-hotel.dto';
import { CreateOmraOrderDto } from './dto/create-omra-order.dto';
import { UpdateOmraOrderDto } from './dto/update-omra-order.dto';
import { CreateOmraVisaDto } from './dto/create-omra-visa.dto';
import { UpdateOmraVisaDto } from './dto/update-omra-visa.dto';
import { CreateOmraProgramDto } from './dto/create-omra-program.dto';
import { UpdateOmraProgramDto } from './dto/update-omra-program.dto';

export interface OmraFilters {
  status?: string;
  hotelId?: string;
  omraType?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
  createdBy?: string; // Filter by creator (for employee access control)
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class OmraService {
  constructor(
    @InjectRepository(OmraHotel)
    private hotelsRepository: Repository<OmraHotel>,
    @InjectRepository(OmraOrder)
    private ordersRepository: Repository<OmraOrder>,
    @InjectRepository(OmraVisa)
    private visasRepository: Repository<OmraVisa>,
    @InjectRepository(OmraProgram)
    private programsRepository: Repository<OmraProgram>,
  ) {}

  // ==================== HOTELS ====================

  async findAllHotels(): Promise<OmraHotel[]> {
    return this.hotelsRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findActiveHotels(): Promise<OmraHotel[]> {
    return this.hotelsRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findHotelById(id: string): Promise<OmraHotel> {
    const hotel = await this.hotelsRepository.findOne({ where: { id } });
    if (!hotel) {
      throw new NotFoundException(`Hotel with ID ${id} not found`);
    }
    return hotel;
  }

  async createHotel(dto: CreateOmraHotelDto): Promise<OmraHotel> {
    const hotel = this.hotelsRepository.create(dto);
    return this.hotelsRepository.save(hotel);
  }

  async updateHotel(id: string, dto: UpdateOmraHotelDto): Promise<OmraHotel> {
    const hotel = await this.findHotelById(id);
    Object.assign(hotel, dto);
    return this.hotelsRepository.save(hotel);
  }

  async deleteHotel(id: string): Promise<void> {
    const hotel = await this.findHotelById(id);

    // Check if hotel is referenced by orders or visas
    const ordersCount = await this.ordersRepository.count({ where: { hotelId: id } });
    const visasCount = await this.visasRepository.count({ where: { hotelId: id } });

    if (ordersCount > 0 || visasCount > 0) {
      throw new BadRequestException(
        `Impossible de supprimer cet hôtel car il est utilisé par ${ordersCount} commande(s) et ${visasCount} visa(s). Veuillez d'abord supprimer ou modifier ces enregistrements.`,
      );
    }

    await this.hotelsRepository.remove(hotel);
  }

  // ==================== ORDERS ====================

  async findAllOrders(filters: OmraFilters = {}): Promise<PaginatedResponse<OmraOrder>> {
    const { status, hotelId, omraType, search, fromDate, toDate, page = 1, limit = 20, createdBy } = filters;

    const queryBuilder = this.ordersRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.hotel', 'hotel')
      .leftJoinAndSelect('order.program', 'program')
      .leftJoinAndSelect('order.creator', 'creator')
      .leftJoinAndSelect('order.assignee', 'assignee');

    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    if (hotelId) {
      queryBuilder.andWhere('order.hotelId = :hotelId', { hotelId });
    }

    if (omraType) {
      queryBuilder.andWhere('order.omraType = :omraType', { omraType });
    }

    if (search) {
      queryBuilder.andWhere(
        '(order.clientName ILIKE :search OR order.phone ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (fromDate) {
      queryBuilder.andWhere('order.orderDate >= :fromDate', {
        fromDate: new Date(fromDate),
      });
    }

    if (toDate) {
      queryBuilder.andWhere('order.orderDate <= :toDate', {
        toDate: new Date(toDate),
      });
    }

    // Filter by creator OR assignedTo (for employee access control)
    if (createdBy) {
      queryBuilder.andWhere(
        '(order.createdBy = :userId OR order.assignedTo = :userId)',
        { userId: createdBy },
      );
    }

    const total = await queryBuilder.getCount();
    const skip = (page - 1) * limit;

    const data = await queryBuilder
      .orderBy('order.createdAt', 'DESC')
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

  async findOrderById(id: string): Promise<OmraOrder> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['hotel', 'program', 'creator', 'assignee'],
    });
    if (!order) {
      throw new NotFoundException(`Omra order with ID ${id} not found`);
    }
    return order;
  }

  async createOrder(dto: CreateOmraOrderDto, userId: string): Promise<OmraOrder> {
    const order = this.ordersRepository.create({
      ...dto,
      createdBy: userId,
    });
    return this.ordersRepository.save(order);
  }

  async updateOrder(id: string, dto: UpdateOmraOrderDto): Promise<OmraOrder> {
    const order = await this.findOrderById(id);
    Object.assign(order, dto);
    return this.ordersRepository.save(order);
  }

  async updateOrderStatus(id: string, status: string): Promise<OmraOrder> {
    const order = await this.findOrderById(id);
    order.status = status as OmraStatus;
    return this.ordersRepository.save(order);
  }

  async deleteOrder(id: string): Promise<void> {
    const order = await this.findOrderById(id);
    await this.ordersRepository.remove(order);
  }

  // ==================== VISAS ====================

  async findAllVisas(filters: OmraFilters = {}): Promise<PaginatedResponse<OmraVisa>> {
    const { status, hotelId, search, fromDate, toDate, page = 1, limit = 20, createdBy } = filters;

    const queryBuilder = this.visasRepository
      .createQueryBuilder('visa')
      .leftJoinAndSelect('visa.hotel', 'hotel')
      .leftJoinAndSelect('visa.creator', 'creator')
      .leftJoinAndSelect('visa.assignee', 'assignee');

    if (status) {
      queryBuilder.andWhere('visa.status = :status', { status });
    }

    if (hotelId) {
      queryBuilder.andWhere('visa.hotelId = :hotelId', { hotelId });
    }

    if (search) {
      queryBuilder.andWhere(
        '(visa.clientName ILIKE :search OR visa.phone ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (fromDate) {
      queryBuilder.andWhere('visa.visaDate >= :fromDate', {
        fromDate: new Date(fromDate),
      });
    }

    if (toDate) {
      queryBuilder.andWhere('visa.visaDate <= :toDate', {
        toDate: new Date(toDate),
      });
    }

    // Filter by creator OR assignedTo (for employee access control)
    if (createdBy) {
      queryBuilder.andWhere(
        '(visa.createdBy = :userId OR visa.assignedTo = :userId)',
        { userId: createdBy },
      );
    }

    const total = await queryBuilder.getCount();
    const skip = (page - 1) * limit;

    const data = await queryBuilder
      .orderBy('visa.createdAt', 'DESC')
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

  async findVisaById(id: string): Promise<OmraVisa> {
    const visa = await this.visasRepository.findOne({
      where: { id },
      relations: ['hotel', 'creator', 'assignee'],
    });
    if (!visa) {
      throw new NotFoundException(`Omra visa with ID ${id} not found`);
    }
    return visa;
  }

  async createVisa(dto: CreateOmraVisaDto, userId: string): Promise<OmraVisa> {
    const visa = this.visasRepository.create({
      ...dto,
      createdBy: userId,
    });
    return this.visasRepository.save(visa);
  }

  async updateVisa(id: string, dto: UpdateOmraVisaDto): Promise<OmraVisa> {
    const visa = await this.findVisaById(id);
    Object.assign(visa, dto);
    return this.visasRepository.save(visa);
  }

  async updateVisaStatus(id: string, status: string): Promise<OmraVisa> {
    const visa = await this.findVisaById(id);
    visa.status = status as OmraStatus;
    return this.visasRepository.save(visa);
  }

  async deleteVisa(id: string): Promise<void> {
    const visa = await this.findVisaById(id);
    await this.visasRepository.remove(visa);
  }

  // ==================== PROGRAMS ====================

  async findAllPrograms(): Promise<OmraProgram[]> {
    return this.programsRepository.find({
      relations: ['hotel', 'creator'],
      order: { createdAt: 'DESC' },
    });
  }

  async findActivePrograms(): Promise<OmraProgram[]> {
    return this.programsRepository.find({
      where: { isActive: true },
      relations: ['hotel', 'creator'],
      order: { name: 'ASC' },
    });
  }

  async findProgramById(id: string): Promise<OmraProgram> {
    const program = await this.programsRepository.findOne({
      where: { id },
      relations: ['hotel', 'creator'],
    });
    if (!program) {
      throw new NotFoundException(`Program with ID ${id} not found`);
    }
    return program;
  }

  async createProgram(dto: CreateOmraProgramDto, userId: string): Promise<OmraProgram> {
    const program = this.programsRepository.create({
      ...dto,
      createdBy: userId,
    });
    return this.programsRepository.save(program);
  }

  async updateProgram(id: string, dto: UpdateOmraProgramDto): Promise<OmraProgram> {
    const program = await this.findProgramById(id);
    Object.assign(program, dto);
    return this.programsRepository.save(program);
  }

  async deleteProgram(id: string): Promise<void> {
    const program = await this.findProgramById(id);

    // Check if program is referenced by orders
    const ordersCount = await this.ordersRepository.count({ where: { programId: id } });
    if (ordersCount > 0) {
      throw new BadRequestException(
        `Impossible de supprimer ce programme car il est utilisé par ${ordersCount} commande(s). Veuillez d'abord supprimer ou modifier ces commandes.`,
      );
    }

    await this.programsRepository.remove(program);
  }

  async getProgramInventory(): Promise<{ programId: string; confirmed: number; remaining: number; total: number }[]> {
    const programs = await this.programsRepository.find({ where: { isActive: true } });

    const result = await Promise.all(
      programs.map(async (program) => {
        const confirmed = await this.ordersRepository.count({
          where: { programId: program.id, status: OmraStatus.CONFIRME },
        });
        return {
          programId: program.id,
          confirmed,
          remaining: program.totalPlaces - confirmed,
          total: program.totalPlaces,
        };
      }),
    );

    return result;
  }

  // ==================== STATS ====================

  async getStats() {
    const orders = await this.ordersRepository.find();
    const visas = await this.visasRepository.find();

    const orderStats = {
      total: orders.length,
      totalRevenue: orders.reduce((sum, o) => sum + Number(o.sellingPrice || 0), 0),
      totalPaid: orders.reduce((sum, o) => sum + Number(o.amountPaid || 0), 0),
      totalProfit: orders.reduce(
        (sum, o) => sum + (Number(o.sellingPrice || 0) - Number(o.buyingPrice || 0)),
        0,
      ),
      byStatus: {
        en_attente: 0,
        confirme: 0,
        termine: 0,
        annule: 0,
        reserve: 0,
      },
    };

    orders.forEach((o) => {
      if (orderStats.byStatus[o.status] !== undefined) {
        orderStats.byStatus[o.status]++;
      }
    });

    const visaStats = {
      total: visas.length,
      totalRevenue: visas.reduce((sum, v) => sum + Number(v.sellingPrice || 0), 0),
      totalPaid: visas.reduce((sum, v) => sum + Number(v.amountPaid || 0), 0),
      totalProfit: visas.reduce(
        (sum, v) => sum + (Number(v.sellingPrice || 0) - Number(v.buyingPrice || 0)),
        0,
      ),
      byStatus: {
        en_attente: 0,
        confirme: 0,
        termine: 0,
        annule: 0,
        reserve: 0,
      },
    };

    visas.forEach((v) => {
      if (visaStats.byStatus[v.status] !== undefined) {
        visaStats.byStatus[v.status]++;
      }
    });

    return {
      orders: orderStats,
      visas: visaStats,
      combined: {
        totalRevenue: orderStats.totalRevenue + visaStats.totalRevenue,
        totalPaid: orderStats.totalPaid + visaStats.totalPaid,
        totalProfit: orderStats.totalProfit + visaStats.totalProfit,
      },
    };
  }
}
