import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateFolderDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUUID()
  @IsOptional()
  parentId?: string;
}

export class UploadDocumentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUUID()
  @IsOptional()
  parentId?: string;
}

export class UpdateDocumentDto {
  @IsString()
  @IsOptional()
  name?: string;
}

export class MoveNodeDto {
  @IsUUID()
  @IsOptional()
  parentId?: string | null;
}
