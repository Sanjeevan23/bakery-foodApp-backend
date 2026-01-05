// src/products/beverage/beverage.controller.ts
import {
  Controller, Get, Post, Put, Delete, Param, Body, UseGuards, UseInterceptors,
  UploadedFile, BadRequestException, NotFoundException, InternalServerErrorException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Types } from 'mongoose';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { BeverageService } from './beverage.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CreateBeverageDto } from './dto/create-beverage.dto';
import { UpdateBeverageDto } from './dto/update-beverage.dto';
import { cloudinaryV2 } from '../../common/cloudinary.config';
import { Role } from '../../common/roles.enum';
import { CategoriesService } from '../../categories/categories.service';
import { flattenValidationErrors, parseArrayField, parseJsonArrayField } from '../../common/utils/request-utils';

@Controller('beverages')
export class BeverageController {
  constructor(
    private readonly beverageService: BeverageService,
    private readonly categoriesService: CategoriesService,
  ) {}

  // anyone with JWT can get list
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    try {
      return await this.beverageService.findAll();
    } catch (err) {
      throw new InternalServerErrorException(err.message || 'Failed to get beverages');
    }
  }

  // anyone with JWT can get single
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getById(@Param('id') id: string) {
    try {
      const item = await this.beverageService.findById(id);
      if (!item) throw new NotFoundException('Beverage not found');
      return item;
    } catch (err: any) {
      if (err.status && err.response) throw err;
      throw new InternalServerErrorException(err.message || 'Failed to get beverage');
    }
  }

  // Admin create (JSON or form-data with optional image)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() rawBody: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      // --- Normalize body for form-data cases ---
      const body = { ...rawBody };

      // sizes: may come as JSON string when using multipart/form-data
      if (body.sizes !== undefined) {
        body.sizes = parseJsonArrayField(body.sizes);
      }

      // ingredients: accept JSON string OR comma-separated string
      body.ingredients = parseArrayField(body.ingredients);

      // Validate required simple fields early
      if (!body.name || !body.type || !body.categoryId) {
        throw new BadRequestException('Missing required fields: name, type, categoryId');
      }

      // Validate categoryId format
      if (!Types.ObjectId.isValid(body.categoryId)) {
        throw new BadRequestException('Invalid categoryId format');
      }

      // Validate DTO manually (supports nested arrays)
      const dto = plainToInstance(CreateBeverageDto, body);
      const errors = await validate(dto, { whitelist: true, forbidNonWhitelisted: true });

      if (errors.length > 0) {
        const messages = flattenValidationErrors(errors);
        throw new BadRequestException(messages);
      }

      // Ensure category exists and get name
      const category = await this.categoriesService.findById(body.categoryId);
      if (!category) throw new NotFoundException('Category not found');

      // Upload image if exists
      let imageUrl = body.image ?? '';
      if (file) {
        const upload = await cloudinaryV2.uploader.upload(file.path, { folder: 'beverages', overwrite: true });
        imageUrl = upload.secure_url;
      }

      // Prepare DB object
      const data = {
        name: dto.name,
        shortDescription: dto.shortDescription ?? '',
        longDescription: dto.longDescription ?? '',
        ingredients: dto.ingredients ?? [],
        sizes: dto.sizes ?? [],
        type: dto.type,
        categoryId: new Types.ObjectId(body.categoryId),
        categoryName: category.name,
        image: imageUrl,
      };

      return await this.beverageService.create(data);
    } catch (err: any) {
      if (err.status && err.response) throw err;
      if (err.name === 'ValidationError') throw new BadRequestException(err.message);
      throw new InternalServerErrorException(err.message || 'Failed to create beverage');
    }
  }

  // Admin update (details + optional image + optional category)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string,
    @Body() rawBody: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      const body = { ...rawBody };

      // parse sizes if string
      if (body.sizes !== undefined) {
        body.sizes = parseJsonArrayField(body.sizes);
      }

      // parse ingredients if string (JSON or comma separated)
      if (body.ingredients !== undefined) {
        body.ingredients = parseArrayField(body.ingredients);
      }

      // If client provided categoryId, validate format + existence
      if (body.categoryId) {
        if (!Types.ObjectId.isValid(body.categoryId)) {
          throw new BadRequestException('Invalid categoryId format');
        }
        const category = await this.categoriesService.findById(body.categoryId);
        body.categoryName = category.name;
        body.categoryId = new Types.ObjectId(body.categoryId);
      }

      // Validate update DTO manually (partial)
      const dto = plainToInstance(UpdateBeverageDto, body);
      const errors = await validate(dto, { skipMissingProperties: true, whitelist: true, forbidNonWhitelisted: true });
      if (errors.length > 0) {
        const messages = flattenValidationErrors(errors);
        throw new BadRequestException(messages);
      }

      // Handle image upload if present
      if (file) {
        const upload = await cloudinaryV2.uploader.upload(file.path, { folder: 'beverages', overwrite: true });
        body.image = upload.secure_url;
      }

      // If sizes provided, ensure not empty
      if (body.sizes && Array.isArray(body.sizes) && body.sizes.length === 0) {
        throw new BadRequestException('At least one size with price is required');
      }

      return await this.beverageService.update(id, body);
    } catch (err: any) {
      if (err.status && err.response) throw err;
      if (err.name === 'ValidationError') throw new BadRequestException(err.message);
      throw new InternalServerErrorException(err.message || 'Failed to update beverage');
    }
  }

  // Admin delete
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      return await this.beverageService.delete(id);
    } catch (err: any) {
      if (err.status && err.response) throw err;
      throw new InternalServerErrorException(err.message || 'Failed to delete beverage');
    }
  }
}
