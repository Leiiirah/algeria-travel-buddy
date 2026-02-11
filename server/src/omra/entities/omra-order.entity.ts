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
import { OmraProgram } from './omra-program.entity';
import { User } from '../../users/entities/user.entity';

export enum OmraOrderType {
  GROUPE = 'groupe',
  LIBRE = 'libre',
}

export enum OmraRoomType {
  CHAMBRE_1 = 'chambre_1',
  CHAMBRE_2 = 'chambre_2',
  CHAMBRE_3 = 'chambre_3',
  CHAMBRE_4 = 'chambre_4',
  CHAMBRE_5 = 'chambre_5',
  SUITE = 'suite',
}

export enum OmraStatus {
  EN_ATTENTE = 'en_attente',
  CONFIRME = 'confirme',
  TERMINE = 'termine',
  ANNULE = 'annule',
  RESERVE = 'reserve',
}

@Entity('omra_orders')
export class OmraOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  clientName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'date', nullable: true })
  orderDate: Date;

  @Column({ type: 'date' })
  periodFrom: Date;

  @Column({ type: 'date' })
  periodTo: Date;

  @Column({ nullable: true })
  hotelId: string;

  @Column({
    type: 'enum',
    enum: OmraRoomType,
    default: OmraRoomType.CHAMBRE_2,
  })
  roomType: OmraRoomType;

  @Column({
    type: 'enum',
    enum: OmraStatus,
    default: OmraStatus.EN_ATTENTE,
  })
  status: OmraStatus;

  @Column({
    type: 'enum',
    enum: OmraOrderType,
    default: OmraOrderType.LIBRE,
  })
  omraType: OmraOrderType;

  @Column({ type: 'uuid', nullable: true })
  programId: string;

  @Column({ type: 'boolean', default: false })
  inProgram: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  sellingPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amountPaid: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  buyingPrice: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  assignedTo: string;

  @Column()
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => OmraHotel, { nullable: true })
  @JoinColumn({ name: 'hotelId' })
  hotel: OmraHotel;

  @ManyToOne(() => OmraProgram, { nullable: true })
  @JoinColumn({ name: 'programId' })
  program: OmraProgram;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignedTo' })
  assignee: User;
}
