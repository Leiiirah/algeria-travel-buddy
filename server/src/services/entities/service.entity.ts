import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Supplier } from '../../suppliers/entities/supplier.entity';

export enum ServiceType {
  VISA = 'visa',
  RESIDENCE = 'residence',
  TICKET = 'ticket',
  DOSSIER = 'dossier',
}

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: ServiceType,
  })
  type: ServiceType;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  defaultSupplierId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  defaultBuyingPrice: number;

  @ManyToOne(() => Supplier, { nullable: true })
  @JoinColumn({ name: 'defaultSupplierId' })
  defaultSupplier: Supplier;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
