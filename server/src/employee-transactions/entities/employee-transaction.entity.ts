import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum EmployeeTransactionType {
  AVANCE = 'avance',
  CREDIT = 'credit',
  SALAIRE = 'salaire',
}

@Entity('employee_transactions')
export class EmployeeTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  employeeId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee: User;

  @Column({
    type: 'enum',
    enum: EmployeeTransactionType,
  })
  type: EmployeeTransactionType;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column('date')
  date: Date;

  @Column({ nullable: true })
  month: string;

  @Column({ type: 'text', nullable: true })
  note: string;

  @Column('uuid')
  recordedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'recordedBy' })
  recorder: User;

  @CreateDateColumn()
  createdAt: Date;
}
