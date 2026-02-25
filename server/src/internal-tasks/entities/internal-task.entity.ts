import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum TaskPriority {
  URGENT = 'urgent',
  NORMAL = 'normal',
  CRITICAL = 'critical',
}

export enum TaskStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export enum TaskVisibility {
  CLEAR = 'clear',
  UNREADABLE = 'unreadable',
}

@Entity('internal_tasks')
export class InternalTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.NORMAL,
  })
  priority: TaskPriority;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.IN_PROGRESS,
  })
  status: TaskStatus;

  @Column({
    type: 'enum',
    enum: TaskVisibility,
    default: TaskVisibility.CLEAR,
  })
  visibility: TaskVisibility;

  @Column({ type: 'uuid' })
  assignedTo: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'assignedTo' })
  assignee: User;

  @Column({ type: 'uuid' })
  createdBy: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @Column({ type: 'boolean', default: false })
  seen: boolean;

  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
