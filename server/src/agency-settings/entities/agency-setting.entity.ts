import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('agency_settings')
export class AgencySetting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  key: string;

  @Column({ type: 'text', default: '' })
  value: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
