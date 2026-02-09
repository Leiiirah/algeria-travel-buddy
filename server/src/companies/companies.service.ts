import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
  ) {}

  findAll(): Promise<Company[]> {
    return this.companyRepo.find({ order: { name: 'ASC' } });
  }

  findActive(): Promise<Company[]> {
    return this.companyRepo.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async create(dto: CreateCompanyDto): Promise<Company> {
    const company = this.companyRepo.create(dto);
    return this.companyRepo.save(company);
  }

  async update(id: string, dto: UpdateCompanyDto): Promise<Company> {
    const company = await this.companyRepo.findOne({ where: { id } });
    if (!company) throw new NotFoundException('Company not found');
    Object.assign(company, dto);
    return this.companyRepo.save(company);
  }

  async remove(id: string): Promise<void> {
    const result = await this.companyRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Company not found');
  }
}
