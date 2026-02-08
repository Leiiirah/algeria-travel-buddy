import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum DocumentNodeType {
  FOLDER = 'folder',
  FILE = 'file',
}

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: DocumentNodeType,
    default: DocumentNodeType.FILE,
  })
  type: DocumentNodeType;

  @Column({ type: 'uuid', nullable: true })
  parentId: string | null;

  @Column({ nullable: true })
  fileUrl: string | null;

  @Column()
  uploadedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Document, (doc) => doc.children, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parentId' })
  parent: Document;

  @OneToMany(() => Document, (doc) => doc.parent)
  children: Document[];

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploadedBy' })
  uploader: User;
}
