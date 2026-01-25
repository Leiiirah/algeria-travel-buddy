import { IsNotEmpty, IsEnum, IsOptional, IsString } from 'class-validator';
import { DocumentCategory } from '../entities/document.entity';

export class UploadDocumentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(DocumentCategory)
  @IsNotEmpty()
  category: DocumentCategory;
}

export class UpdateDocumentDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(DocumentCategory)
  @IsOptional()
  category?: DocumentCategory;
}
