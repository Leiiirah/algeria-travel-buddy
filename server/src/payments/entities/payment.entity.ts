import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Command } from '../../commands/entities/command.entity';
import { User } from '../../users/entities/user.entity';

export enum PaymentMethod {
  ESPECES = 'especes',
  VIREMENT = 'virement',
  CHEQUE = 'cheque',
  CARTE = 'carte',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  commandId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  method: PaymentMethod;

  @Column()
  recordedBy: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Command, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'commandId' })
  command: Command;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'recordedBy' })
  recorder: User;
}
