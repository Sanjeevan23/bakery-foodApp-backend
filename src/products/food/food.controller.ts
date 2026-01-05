// src/products/food/food.controller.ts
import {
  Controller, Get, Post, Put, Delete, Param, Body, UseGuards, UseInterceptors, UploadedFile,
  BadRequestException, NotFoundException, InternalServerErrorException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Types } from 'mongoose';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { FoodService } from './food.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CreateFoodDto } from './dto/create-food.dto';
import { UpdateFoodDto } from './dto/update-food.dto';
import { cloudinaryV2 } from '../../common/cloudinary.config';
import { Role } from '../../common/roles.enum';
import { CategoriesService } from '../../categories/categories.service';

import { flattenValidationErrors, parseArrayField } from '../../common/utils/request-utils';

@Controller('food')
export class FoodController {
  constructor(
    private readonly foodService: FoodService,
    private readonly categoriesService: CategoriesService,
  ) { }

  // GET all foods (Customer / Cashier / Admin)
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    try {
      return await this.foodService.findAll();
    } catch (err) {
      throw new InternalServerErrorException(err.message || 'Failed to get foods');
    }
  }

  // Admin only → Create food (JSON or multipart/form-data)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() rawBody: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      // normalize body (form-data sends everything as strings)
      const body: any = { ...rawBody };

      // ingredients: accept JSON string OR comma-separated string
      body.ingredients = parseArrayField(body.ingredients);

      // Basic required checks
      if (!body.name || body.price === undefined || !body.type || !body.categoryId) {
        throw new BadRequestException('Missing required fields: name, price, type, categoryId');
      }

      // validate categoryId format
      if (!Types.ObjectId.isValid(body.categoryId)) {
        throw new BadRequestException('Invalid categoryId format');
      }

      // Manual DTO validation (handles nested arrays reliably)
      const dto = plainToInstance(CreateFoodDto, body);
      const errors = await validate(dto, { whitelist: true, forbidNonWhitelisted: true });
      if (errors.length > 0) {
        const messages = flattenValidationErrors(errors);
        throw new BadRequestException(messages);
      }

      // ensure category exists and fetch name
      const category = await this.categoriesService.findById(body.categoryId);
      if (!category) throw new NotFoundException('Category not found');

      // upload image if present
      let imageUrl = body.image ?? '';
      if (file) {
        const upload = await cloudinaryV2.uploader.upload(file.path, {
          folder: 'food',
          overwrite: true,
        });
        imageUrl = upload.secure_url;
      }

      const foodData = {
        name: dto.name,
        shortDescription: dto.shortDescription ?? '',
        longDescription: dto.longDescription ?? '',
        ingredients: dto.ingredients ?? [],
        price: dto.price,
        type: dto.type,
        categoryId: new Types.ObjectId(body.categoryId),
        categoryName: category.name,
        image: imageUrl,
      };

      return await this.foodService.create(foodData);
    } catch (err: any) {
      if (err.name === 'ValidationError') {
        throw new BadRequestException(err.message);
      }
      if (err.status && err.response) throw err;
      throw new InternalServerErrorException(err.message || 'Failed to create food');
    }
  }

  // Admin only → Update food (details + optional image + optional category)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put(':id')
  @UseInterceptors(FileInterceptor('image')) // optional image
  async update(
    @Param('id') id: string,
    @Body() rawBody: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      const body: any = { ...rawBody };

      // parse ingredients if provided as string (JSON string or comma list)
      if (body.ingredients !== undefined) {
        body.ingredients = parseArrayField(body.ingredients);
      }

      // If changing category, validate id + existence
      if (body.categoryId) {
        if (!Types.ObjectId.isValid(body.categoryId)) {
          throw new BadRequestException('Invalid categoryId format');
        }
        const category = await this.categoriesService.findById(body.categoryId);
        body.categoryName = category.name;
        body.categoryId = new Types.ObjectId(body.categoryId);
      }

      // If image provided, upload and set url
      if (file) {
        const upload = await cloudinaryV2.uploader.upload(file.path, {
          folder: 'food',
          overwrite: true,
        });
        body.image = upload.secure_url;
      }

      // Validate update DTO manually (skip missing props)
      const dto = plainToInstance(UpdateFoodDto, body);
      const errors = await validate(dto, { skipMissingProperties: true, whitelist: true, forbidNonWhitelisted: true });
      if (errors.length > 0) {
        const messages = flattenValidationErrors(errors);
        throw new BadRequestException(messages);
      }

      // Now perform update
      return await this.foodService.update(id, body);
    } catch (err: any) {
      if (err.status && err.response) throw err;
      if (err.name === 'ValidationError') throw new BadRequestException(err.message);
      throw new InternalServerErrorException(err.message || 'Failed to update food');
    }
  }

  // Admin only → Delete food
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      return await this.foodService.delete(id);
    } catch (err: any) {
      if (err.status && err.response) throw err;
      throw new InternalServerErrorException(err.message || 'Failed to delete food');
    }
  }
}
