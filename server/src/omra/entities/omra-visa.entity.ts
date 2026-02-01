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
import { OmraStatus } from './omra-order.entity';

@Entity('omra_visas')
export class OmraVisa {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  clientName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'date' })
  visaDate: Date;

  @Column({ type: 'date' })
  entryDate: Date;

  @Column({ nullable: true })
  hotelId: string;

  @Column({
    type: 'enum',
    enum: OmraStatus,
    default: OmraStatus.EN_ATTENTE,
  })
  status: OmraStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  sellingPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amountPaid: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  buyingPrice: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column()
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => OmraHotel, { nullable: true })
  @JoinColumn({ name: 'hotelId' })
  hotel: OmraHotel;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdBy' })
  creator: User;
}
