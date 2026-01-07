//src/extra-ingredients/extra-ingredients.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ExtraIngredientsService } from './extra-ingredients.service';
import { CreateExtraIngredientDto } from './dto/create-extra-ingredient.dto';
import { UpdateExtraIngredientDto } from './dto/update-extra-ingredient.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/roles.enum';

@Controller('extra-ingredients')
export class ExtraIngredientsController {
  constructor(private readonly service: ExtraIngredientsService) {}

  // USER → GET ACTIVE
  @UseGuards(JwtAuthGuard)
  @Get()
  async getActive() {
    return this.service.findAllActive();
  }

  // ADMIN → GET ALL
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin')
  async getAllAdmin() {
    return this.service.findAllAdmin();
  }

  // ADMIN → CREATE
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  async create(@Body() dto: CreateExtraIngredientDto) {
    return this.service.create(dto);
  }

  // ADMIN → UPDATE
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateExtraIngredientDto,
  ) {
    return this.service.update(id, dto);
  }

  // ADMIN → DELETE
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
