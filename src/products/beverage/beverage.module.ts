// src/products/beverage/beverage.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';

import { BeverageController } from './beverage.controller';
import { BeverageService } from './beverage.service';
import { Beverage, BeverageSchema } from './schemas/beverage.schema';
import { SizePriceSchema } from './schemas/size-price.schema';
import { CategoriesModule } from '../../categories/categories.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Beverage.name, schema: BeverageSchema },
      { name: 'SizePrice', schema: SizePriceSchema },
    ]),
    MulterModule.register({ dest: './uploads' }),
    CategoriesModule,
  ],
  controllers: [BeverageController],
  providers: [BeverageService],
})
export class BeverageModule {}
