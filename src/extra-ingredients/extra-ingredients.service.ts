//src/extra-ingredients/extra-ingredients.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ExtraIngredient } from './schemas/extra-ingredient.schema';
import { CreateExtraIngredientDto } from './dto/create-extra-ingredient.dto';
import { UpdateExtraIngredientDto } from './dto/update-extra-ingredient.dto';

@Injectable()
export class ExtraIngredientsService {
  constructor(
    @InjectModel(ExtraIngredient.name)
    private model: Model<ExtraIngredient>,
  ) {}

  async create(dto: CreateExtraIngredientDto) {
    try {
      return await this.model.create(dto);
    } catch (err: any) {
      if (err.code === 11000) {
        throw new BadRequestException('Extra ingredient already exists');
      }
      throw err;
    }
  }

  async findAllActive() {
    return this.model.find({ isActive: true }).sort({ name: 1 });
  }

  async findAllAdmin() {
    return this.model.find().sort({ createdAt: -1 });
  }

  async findById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid extra ingredient id');
    }

    const item = await this.model.findById(id);
    if (!item) throw new NotFoundException('Extra ingredient not found');

    return item;
  }

  async update(id: string, dto: UpdateExtraIngredientDto) {
    const updated = await this.model.findByIdAndUpdate(id, dto, {
      new: true,
    });

    if (!updated) throw new NotFoundException('Extra ingredient not found');
    return updated;
  }

  async delete(id: string) {
    const deleted = await this.model.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Extra ingredient not found');
    return { message: 'Extra ingredient deleted' };
  }
}
