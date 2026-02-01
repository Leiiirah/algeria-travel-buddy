import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request, UseInterceptors, UploadedFile, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Response } from 'express';
import { DocumentsService } from './documents.service';
import { UploadDocumentDto, UpdateDocumentDto } from './dto/document.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) { }

  @Get()
  findAll(@Query('category') category?: string) {
    return this.documentsService.findAll(category);
  }

  @Post('upload')
  @Roles('admin')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${uuidv4()}${ext}`);
      },
    }),
  }))
  upload(@Body() dto: UploadDocumentDto, @UploadedFile() file: Express.Multer.File, @Request() req: any) {
    return this.documentsService.upload(dto, file, req.user.id);
  }

  @Patch(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateDto: UpdateDocumentDto) {
    return this.documentsService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.documentsService.remove(id);
  }

  @Get(':id/download')
  async download(@Param('id') id: string, @Res() res: Response) {
    const doc = await this.documentsService.findOne(id);
    return res.sendFile(doc.fileUrl, { root: './uploads' });
  }
}
