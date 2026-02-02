import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Supplier } from '../../suppliers/entities/supplier.entity';

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  type: string; // Dynamic reference to ServiceType.code

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
