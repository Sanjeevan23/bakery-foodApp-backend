// src/ads/ads.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdsController } from './ads.controller';
import { AdsService } from './ads.service';
import { Ad, AdSchema } from './schemas/ads.schema';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Ad.name, schema: AdSchema }]),
     MulterModule.register({ dest: './uploads/ads' }),
  ],
  controllers: [AdsController],
  providers: [AdsService],
})
export class AdsModule {}
