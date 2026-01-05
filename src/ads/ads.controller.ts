// src/ads/ads.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdsService } from './ads.service';
import { CreateAdDto } from './dto/create-ad.dto';
import { UpdateAdDto } from './dto/update-ad.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/roles.enum';
import { cloudinaryV2 } from '../common/cloudinary.config';

@Controller('ads')
export class AdsController {
  constructor(private readonly adsService: AdsService) {}

  // USER → GET ALL ACTIVE ADS
  @Get()
  async getAll() {
    return this.adsService.findAllForUsers();
  }

  // ADMIN → CREATE
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() body: CreateAdDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Ad image is required');
    }

    const upload = await cloudinaryV2.uploader.upload(file.path, {
      folder: 'ads',
    });

    return this.adsService.create({
      image: upload.secure_url,
      title: body.title,
      isActive: body.isActive ?? true,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
    });
  }

  // ADMIN → UPDATE
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string,
    @Body() body: UpdateAdDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const data: any = { ...body };

    if (file) {
      const upload = await cloudinaryV2.uploader.upload(file.path, {
        folder: 'ads',
      });
      data.image = upload.secure_url;
    }

    if (body.endDate) {
      data.endDate = new Date(body.endDate);
    }

    return this.adsService.update(id, data);
  }

  // ADMIN → DELETE
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.adsService.delete(id);
  }
}
