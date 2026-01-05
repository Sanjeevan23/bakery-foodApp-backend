// src/ads/ads.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ad } from './schemas/ads.schema';

@Injectable()
export class AdsService {
  constructor(
    @InjectModel(Ad.name) private adModel: Model<Ad>,
  ) { }

  async create(data: Partial<Ad>) {
    return this.adModel.create(data);
  }

  async findAllForUsers() {
    const now = new Date();

    const filter = {
      isActive: true,
      $or: [
        { endDate: { $exists: false } },
        { endDate: { $gte: now } },
      ],
    };

    const [ads, total] = await Promise.all([
      this.adModel.find(filter).sort({ createdAt: -1 }),
      this.adModel.countDocuments(filter),
    ]);

    return {
      total,
      ads,
    };
  }

  async findById(id: string) {
    const ad = await this.adModel.findById(id);
    if (!ad) throw new NotFoundException('Ad not found');
    return ad;
  }

  async update(id: string, data: Partial<Ad>) {
    const ad = await this.adModel.findByIdAndUpdate(id, data, { new: true });
    if (!ad) throw new NotFoundException('Ad not found');
    return ad;
  }

  async delete(id: string) {
    const ad = await this.adModel.findByIdAndDelete(id);
    if (!ad) throw new NotFoundException('Ad not found');
    return { message: 'Ad deleted successfully' };
  }
}
