import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ExpenseCategory {
  FOURNITURES = 'fournitures',
  EQUIPEMENT = 'equipement',
  FACTURES = 'factures',
  TRANSPORT = 'transport',
  MAINTENANCE = 'maintenance',
  MARKETING = 'marketing',
  AUTRE = 'autre',
}

export enum PaymentMethod {
  ESPECES = 'especes',
  VIREMENT = 'virement',
  CHEQUE = 'cheque',
  CARTE = 'carte',
}

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ExpenseCategory,
    default: ExpenseCategory.AUTRE,
  })
  category: ExpenseCategory;

  @Column({ length: 255 })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.ESPECES,
  })
  paymentMethod: PaymentMethod;

  @Column({ length: 255, nullable: true })
  vendor: string;

  @Column({ nullable: true })
  receiptUrl: string;

  @Column({ type: 'text', nullable: true })
  note: string;

  @Column({ type: 'uuid' })
  recordedBy: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'recordedBy' })
  recorder: User;

  @CreateDateColumn()
  createdAt: Date;
}
