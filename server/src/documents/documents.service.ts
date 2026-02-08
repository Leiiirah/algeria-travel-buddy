import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Document, DocumentNodeType } from './entities/document.entity';
import { CreateFolderDto, UploadDocumentDto, UpdateDocumentDto, MoveNodeDto } from './dto/document.dto';
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

  async findByParent(parentId?: string): Promise<Document[]> {
    const where = parentId
      ? { parentId }
      : { parentId: IsNull() };

    return this.documentsRepository.find({
      where,
      relations: ['uploader'],
      order: {
        type: 'ASC', // folders first (folder < file alphabetically)
        name: 'ASC',
      },
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

  async getAncestors(id: string): Promise<{ id: string; name: string }[]> {
    const ancestors: { id: string; name: string }[] = [];
    let current = await this.documentsRepository.findOne({ where: { id } });

    if (!current) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    // Walk up the tree
    while (current && current.parentId) {
      current = await this.documentsRepository.findOne({
        where: { id: current.parentId },
      });
      if (current) {
        ancestors.unshift({ id: current.id, name: current.name });
      }
    }

    return ancestors;
  }

  async createFolder(dto: CreateFolderDto, userId: string): Promise<Document> {
    const folder = this.documentsRepository.create({
      name: dto.name,
      type: DocumentNodeType.FOLDER,
      parentId: dto.parentId || null,
      fileUrl: null,
      uploadedBy: userId,
    });
    return this.documentsRepository.save(folder);
  }

  async upload(dto: UploadDocumentDto, file: Express.Multer.File, userId: string): Promise<Document> {
    const document = this.documentsRepository.create({
      name: dto.name,
      type: DocumentNodeType.FILE,
      parentId: dto.parentId || null,
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

  async move(id: string, moveDto: MoveNodeDto): Promise<Document> {
    const document = await this.findOne(id);
    document.parentId = moveDto.parentId ?? null;
    return this.documentsRepository.save(document);
  }

  async remove(id: string): Promise<void> {
    const document = await this.findOne(id);

    // Recursively collect all descendant IDs
    const allNodes = await this.collectDescendants(id);
    allNodes.push(document);

    // Delete physical files for all file nodes
    for (const node of allNodes) {
      if (node.type === DocumentNodeType.FILE && node.fileUrl) {
        const filePath = path.join(this.uploadPath, node.fileUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    // Remove all nodes (cascade should handle children, but let's be explicit)
    const ids = allNodes.map((n) => n.id);
    await this.documentsRepository.delete(ids);
  }

  private async collectDescendants(parentId: string): Promise<Document[]> {
    const children = await this.documentsRepository.find({
      where: { parentId },
    });

    let all: Document[] = [...children];
    for (const child of children) {
      if (child.type === DocumentNodeType.FOLDER) {
        const grandChildren = await this.collectDescendants(child.id);
        all = all.concat(grandChildren);
      }
    }

    return all;
  }

  getFilePath(id: string): string {
    return `/documents/${id}/download`;
  }
}
