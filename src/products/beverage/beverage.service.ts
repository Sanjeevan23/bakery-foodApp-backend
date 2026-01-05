// src/products/beverage/beverage.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Beverage, BeverageDocument } from './schemas/beverage.schema';

@Injectable()
export class BeverageService {
    constructor(
        @InjectModel(Beverage.name)
        private beverageModel: Model<BeverageDocument>,
    ) { }

    create(data: Partial<Beverage>) {
        return this.beverageModel.create(data);
    }

    async findAll() {
        const items = await this.beverageModel.find({ isActive: true });
        return {
            total: items.length,
            items,
        };
    }

    findById(id: string) {
        return this.beverageModel.findById(id);
    }

    async update(id: string, data: Partial<Beverage>) {
        const updated = await this.beverageModel.findByIdAndUpdate(id, data, { new: true });
        if (!updated) throw new NotFoundException('Beverage not found');
        return updated;
    }

    async delete(id: string) {
        const b = await this.beverageModel.findByIdAndDelete(id);
        if (!b) throw new NotFoundException('Beverage not found');
        return { message: 'Beverage deleted successfully' };
    }
}
