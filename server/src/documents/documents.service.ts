import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document, DocumentCategory } from './entities/document.entity';
import { UploadDocumentDto, UpdateDocumentDto } from './dto/document.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DocumentsService {
  private uploadPath = './uploads';

  constructor(
    @InjectRepository(Document)
    private documentsRepository: Repository<Document>,
  ) {
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async findAll(category?: string): Promise<Document[]> {
    const where = category ? { category: category as DocumentCategory } : {};
    return this.documentsRepository.find({
      where,
      relations: ['uploader'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Document> {
    const document = await this.documentsRepository.findOne({
      where: { id },
      relations: ['uploader'],
    });
    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }
    return document;
  }

  async upload(dto: UploadDocumentDto, file: Express.Multer.File, userId: string): Promise<Document> {
    const document = this.documentsRepository.create({
      name: dto.name,
      category: dto.category,
      fileUrl: file.filename,
      uploadedBy: userId,
    });
    return this.documentsRepository.save(document);
  }

  async update(id: string, updateDto: UpdateDocumentDto): Promise<Document> {
    const document = await this.findOne(id);
    Object.assign(document, updateDto);
    return this.documentsRepository.save(document);
  }

  async remove(id: string): Promise<void> {
    const document = await this.findOne(id);
    const filePath = path.join(this.uploadPath, document.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    await this.documentsRepository.remove(document);
  }

  getFilePath(id: string): string {
    return `/documents/${id}/download`;
  }
}
