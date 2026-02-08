import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OmraHotel } from './omra-hotel.entity';
import { User } from '../../users/entities/user.entity';

@Entity('omra_programs')
export class OmraProgram {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'date' })
  periodFrom: Date;

  @Column({ type: 'date' })
  periodTo: Date;

  @Column({ type: 'int' })
  totalPlaces: number;

  @Column({ type: 'uuid', nullable: true })
  hotelId: string;

  @Column({ type: 'jsonb', default: {} })
  pricing: Record<string, number>;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'uuid' })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => OmraHotel, { nullable: true })
  @JoinColumn({ name: 'hotelId' })
  hotel: OmraHotel;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  creator: User;
}
