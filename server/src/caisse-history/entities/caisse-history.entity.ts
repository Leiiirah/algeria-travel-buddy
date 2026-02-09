import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('caisse_history')
export class CaisseHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  employeeId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'employeeId' })
  employee: User;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  caisseAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  impayesAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  beneficesAmount: number;

  @Column({ type: 'int' })
  commandCount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  newCaisse: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  newImpayes: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  newBenefices: number;

  @Column({ type: 'uuid' })
  adminId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'adminId' })
  admin: User;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'timestamp', default: () => 'NOW()' })
  resetDate: Date;

  @CreateDateColumn()
  createdAt: Date;
}
