import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Response } from 'express';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { SupplierTransactionsService } from './supplier-transactions.service';
import { CreateSupplierTransactionDto } from './dto/create-supplier-transaction.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('supplier-transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin') // All supplier transaction operations require admin role
export class SupplierTransactionsController {
  constructor(
    private readonly transactionsService: SupplierTransactionsService,
  ) {}

  @Get()
  findAll() {
    return this.transactionsService.findAll();
  }

  @Get('supplier/:supplierId')
  findBySupplier(@Param('supplierId') supplierId: string) {
    return this.transactionsService.findBySupplier(supplierId);
  }

  @Post()
  create(@Body() createDto: CreateSupplierTransactionDto, @Request() req: any) {
    return this.transactionsService.create(createDto, req.user.id);
  }

  @Post('with-file')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/receipts',
        filename: (req, file, cb) => {
          const ext = path.extname(file.originalname);
          cb(null, `receipt-${uuidv4()}${ext}`);
        },
      }),
    limits: {
      fileSize: 20 * 1024 * 1024, // 20MB maximum
    },
      fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
          cb(null, true);
        } else {
          cb(new Error('Only PDF files are allowed'), false);
        }
      },
    }),
  )
  createWithFile(
    @Body() createDto: CreateSupplierTransactionDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    const receiptUrl = file?.filename || undefined;
    return this.transactionsService.create({ ...createDto, receiptUrl }, req.user.id);
  }

  @Get(':id/download')
  async downloadReceipt(@Param('id') id: string, @Res() res: Response) {
    const transaction = await this.transactionsService.findOne(id);
    if (!transaction.receiptUrl) {
      throw new NotFoundException('No receipt attached to this transaction');
    }
    return res.sendFile(transaction.receiptUrl, { root: './uploads/receipts' });
  }

  @Get(':id/view')
  async viewReceipt(@Param('id') id: string, @Res() res: Response) {
    const transaction = await this.transactionsService.findOne(id);
    if (!transaction.receiptUrl) {
      throw new NotFoundException('No receipt attached to this transaction');
    }
    
    // Set headers for inline viewing (browser displays instead of downloading)
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${transaction.receiptUrl}"`);
    
    return res.sendFile(transaction.receiptUrl, { root: './uploads/receipts' });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transactionsService.remove(id);
  }
}
