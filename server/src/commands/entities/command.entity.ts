import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Service } from '../../services/entities/service.entity';
import { Supplier } from '../../suppliers/entities/supplier.entity';
import { User } from '../../users/entities/user.entity';

export enum CommandStatus {
  EN_ATTENTE = 'en_attente',
  EN_COURS = 'en_cours',
  TERMINE = 'termine',
  ANNULE = 'annule',
}

@Entity('commands')
export class Command {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  serviceId: string;

  @Column()
  supplierId: string;

  @Column({ type: 'jsonb' })
  data: Record<string, any>;

  @Column({
    type: 'enum',
    enum: CommandStatus,
    default: CommandStatus.EN_ATTENTE,
  })
  status: CommandStatus;

  @Column({ nullable: true })
  destination: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  sellingPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amountPaid: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  buyingPrice: number;

  @Column()
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Service, { nullable: true })
  @JoinColumn({ name: 'serviceId' })
  service: Service;

  @ManyToOne(() => Supplier, { nullable: true })
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdBy' })
  creator: User;
}
