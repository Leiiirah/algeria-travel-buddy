import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgencySetting } from './entities/agency-setting.entity';

const DEFAULT_SETTINGS: Record<string, string> = {
  legalName: 'EL HIKMA TOURISME ET VOYAGE',
  address: '02 rue de kolea zaban blida .09001',
  phone: '020475949',
  email: 'elhikmatours@gmail.com',
  nif: '001209080768687',
  nis: '001209010018958',
  rc: '09/00-0807686B12',
  bankName: 'ccp',
  bankAccount: '00799999001499040728',
  mobilePhone: '0770236424',
  licenseNumber: '',
  arabicName: 'الحكمة للسياحة والأسفار',
  arabicAddress: '02، طريق القليعة، زعبانة، 09001، البليدة، الجزائر',
};

@Injectable()
export class AgencySettingsService {
  constructor(
    @InjectRepository(AgencySetting)
    private readonly repo: Repository<AgencySetting>,
  ) {}

  async getAll(): Promise<Record<string, string>> {
    const settings = await this.repo.find();
    const result: Record<string, string> = {};
    for (const s of settings) {
      result[s.key] = s.value;
    }
    return result;
  }

  async update(settings: Record<string, string>): Promise<Record<string, string>> {
    for (const [key, value] of Object.entries(settings)) {
      const existing = await this.repo.findOne({ where: { key } });
      if (existing) {
        existing.value = value;
        await this.repo.save(existing);
      } else {
        await this.repo.save(this.repo.create({ key, value }));
      }
    }
    return this.getAll();
  }

  async seed(): Promise<void> {
    const count = await this.repo.count();
    if (count === 0) {
      for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
        await this.repo.save(this.repo.create({ key, value }));
      }
    }
  }
}
