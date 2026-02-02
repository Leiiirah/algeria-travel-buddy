import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceType } from './entities/service-type.entity';
import { CreateServiceTypeDto } from './dto/create-service-type.dto';
import { UpdateServiceTypeDto } from './dto/update-service-type.dto';

@Injectable()
export class ServiceTypesService {
  constructor(
    @InjectRepository(ServiceType)
    private serviceTypesRepository: Repository<ServiceType>,
  ) {}

  async findAll(): Promise<ServiceType[]> {
    return this.serviceTypesRepository.find({
      order: { createdAt: 'ASC' },
    });
  }

  async findActive(): Promise<ServiceType[]> {
    return this.serviceTypesRepository.find({
      where: { isActive: true },
      order: { nameFr: 'ASC' },
    });
  }

  async findOne(id: string): Promise<ServiceType> {
    const serviceType = await this.serviceTypesRepository.findOne({ where: { id } });
    if (!serviceType) {
      throw new NotFoundException(`Service type with ID ${id} not found`);
    }
    return serviceType;
  }

  async findByCode(code: string): Promise<ServiceType | null> {
    return this.serviceTypesRepository.findOne({ where: { code } });
  }

  async create(createServiceTypeDto: CreateServiceTypeDto): Promise<ServiceType> {
    // Check if code already exists
    const existing = await this.findByCode(createServiceTypeDto.code);
    if (existing) {
      throw new ConflictException(`Service type with code "${createServiceTypeDto.code}" already exists`);
    }

    const serviceType = this.serviceTypesRepository.create(createServiceTypeDto);
    return this.serviceTypesRepository.save(serviceType);
  }

  async update(id: string, updateServiceTypeDto: UpdateServiceTypeDto): Promise<ServiceType> {
    const serviceType = await this.findOne(id);

    // Check if code is being changed to an existing one
    if (updateServiceTypeDto.code && updateServiceTypeDto.code !== serviceType.code) {
      const existing = await this.findByCode(updateServiceTypeDto.code);
      if (existing) {
        throw new ConflictException(`Service type with code "${updateServiceTypeDto.code}" already exists`);
      }
    }

    Object.assign(serviceType, updateServiceTypeDto);
    return this.serviceTypesRepository.save(serviceType);
  }

  async toggleStatus(id: string): Promise<ServiceType> {
    const serviceType = await this.findOne(id);
    serviceType.isActive = !serviceType.isActive;
    return this.serviceTypesRepository.save(serviceType);
  }

  async remove(id: string): Promise<void> {
    const serviceType = await this.findOne(id);
    // Soft delete by setting isActive to false
    serviceType.isActive = false;
    await this.serviceTypesRepository.save(serviceType);
  }

  async seed(): Promise<void> {
    const existingTypes = await this.serviceTypesRepository.count();
    if (existingTypes > 0) {
      return; // Already seeded
    }

    const defaultTypes = [
      { code: 'visa', nameFr: 'Visa', nameAr: 'تأشيرة', icon: 'FileText' },
      { code: 'residence', nameFr: 'Résidence / Hôtel', nameAr: 'إقامة / فندق', icon: 'Hotel' },
      { code: 'ticket', nameFr: 'Billetterie Avion', nameAr: 'تذاكر طيران', icon: 'Plane' },
      { code: 'dossier', nameFr: 'Traitement de dossier', nameAr: 'معالجة ملف', icon: 'Folder' },
      { code: 'billet_bateau', nameFr: 'Billet Bateau', nameAr: 'تذكرة باخرة', icon: 'Ship' },
      { code: 'billet_tilex', nameFr: 'Billet Tilex', nameAr: 'تذكرة تيلكس', icon: 'Bus' },
      { code: 'billets', nameFr: 'Billets', nameAr: 'تذاكر', icon: 'Ticket' },
    ];

    for (const type of defaultTypes) {
      const serviceType = this.serviceTypesRepository.create(type);
      await this.serviceTypesRepository.save(serviceType);
    }
  }
}
