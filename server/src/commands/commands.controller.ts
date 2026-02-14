import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  Res,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { CommandsService, CommandFilters } from './commands.service';
import { CreateCommandDto } from './dto/create-command.dto';
import { UpdateCommandDto } from './dto/update-command.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Transform } from 'class-transformer';

@Controller('commands')
@UseGuards(JwtAuthGuard)
export class CommandsController implements OnModuleInit {
  constructor(private readonly commandsService: CommandsService) {}

  onModuleInit() {
    // Create uploads/passports directory if it doesn't exist
    const uploadDir = './uploads/passports';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
  }

  @Get()
  findAll(@Query() filters: CommandFilters, @Request() req: any) {
    // Employees can only see their own commands
    const isAdmin = req.user.role === 'admin';
    if (!isAdmin) {
      filters.createdBy = req.user.id;
    }
    return this.commandsService.findAll(filters);
  }

  @Get('by-employee/:employeeId')
  findByEmployee(@Param('employeeId') employeeId: string, @Request() req: any) {
    // Admin only endpoint
    if (req.user.role !== 'admin') {
      throw new NotFoundException('Not found');
    }
    return this.commandsService.findAll({ createdBy: employeeId, limit: 1000 });
  }

  @Get('stats')
  getStats(@Request() req: any) {
    const isAdmin = req.user.role === 'admin';
    return this.commandsService.getStats(isAdmin ? undefined : req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commandsService.findOne(id);
  }

  @Post()
  create(@Body() createCommandDto: CreateCommandDto, @Request() req: any) {
    return this.commandsService.create(createCommandDto, req.user.id);
  }

  @Post('with-passport')
  @UseInterceptors(
    FileInterceptor('passport', {
      storage: diskStorage({
        destination: './uploads/passports',
        filename: (req, file, cb) => {
          const ext = path.extname(file.originalname);
          cb(null, `passport-${uuidv4()}${ext}`);
        },
      }),
      limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
      fileFilter: (req, file, cb) => {
        const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
        cb(null, allowed.includes(file.mimetype));
      },
    }),
  )
  createWithPassport(
    @Body() createDto: any,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    // Parse data from FormData (strings need to be converted)
    const parsedDto: CreateCommandDto = {
      serviceId: createDto.serviceId,
      supplierId: createDto.supplierId,
      data: typeof createDto.data === 'string' ? JSON.parse(createDto.data) : createDto.data,
      destination: createDto.destination,
      sellingPrice: parseFloat(createDto.sellingPrice) || 0,
      amountPaid: parseFloat(createDto.amountPaid) || 0,
      buyingPrice: parseFloat(createDto.buyingPrice) || 0,
      passportUrl: file?.filename || undefined,
      assignedTo: createDto.assignedTo || undefined,
    };
    return this.commandsService.create(parsedDto, req.user.id);
  }

  @Get(':id/passport/view')
  async viewPassport(@Param('id') id: string, @Res() res: Response) {
    const command = await this.commandsService.findOne(id);
    if (!command.passportUrl) {
      throw new NotFoundException('No passport attached');
    }
    const ext = path.extname(command.passportUrl).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
    };
    res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${command.passportUrl}"`);
    return res.sendFile(command.passportUrl, { root: './uploads/passports' });
  }

  @Get(':id/passport/download')
  async downloadPassport(@Param('id') id: string, @Res() res: Response) {
    const command = await this.commandsService.findOne(id);
    if (!command.passportUrl) {
      throw new NotFoundException('No passport attached');
    }
    res.setHeader('Content-Disposition', `attachment; filename="${command.passportUrl}"`);
    return res.sendFile(command.passportUrl, { root: './uploads/passports' });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommandDto: UpdateCommandDto) {
    return this.commandsService.update(id, updateCommandDto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.commandsService.updateStatus(id, status);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commandsService.remove(id);
  }
}
