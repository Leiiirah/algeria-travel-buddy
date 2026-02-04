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
  DOSSIER_INCOMPLET = 'dossier_incomplet',
  DEPOSE = 'depose',
  EN_TRAITEMENT = 'en_traitement',
  ACCEPTE = 'accepte',
  REFUSE = 'refuse',
  VISA_DELIVRE = 'visa_delivre',
  RETIRE = 'retire',
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
    default: CommandStatus.DOSSIER_INCOMPLET,
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

  @Column({ nullable: true })
  passportUrl: string;

  @Column({ nullable: true })
  assignedTo: string;

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

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignedTo' })
  assignee: User;
}
