import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Command } from '../../commands/entities/command.entity';

export type ClientInvoiceType = 'proforma' | 'finale';
export type ClientInvoiceStatus = 'brouillon' | 'envoyee' | 'payee' | 'annulee';

@Entity('client_invoices')
export class ClientInvoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  invoiceNumber: string;

  @Column({
    type: 'enum',
    enum: ['proforma', 'finale'],
    default: 'proforma',
  })
  type: ClientInvoiceType;

  @Column({
    type: 'enum',
    enum: ['brouillon', 'envoyee', 'payee', 'annulee'],
    default: 'brouillon',
  })
  status: ClientInvoiceStatus;

  @Column({ type: 'uuid', nullable: true })
  commandId: string | null;

  @ManyToOne(() => Command, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'commandId' })
  command: Command | null;

  @Column({ type: 'varchar', length: 255 })
  clientName: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  clientPhone: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  clientEmail: string | null;

  @Column({ type: 'varchar', length: 255 })
  serviceName: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  serviceType: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  destination: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  paidAmount: number;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  invoiceDate: Date;

  @Column({ type: 'date', nullable: true })
  dueDate: Date | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'uuid' })
  createdBy: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
