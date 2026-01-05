// ConfigModule.forRoot({ isGlobal: true }) → we can read env anywhere
// DatabaseModule → connects to MongoDB

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './config/database.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { FoodModule } from './products/food/food.module';
import { BeverageModule } from './products/beverage/beverage.module';
import { AdsModule } from './ads/ads.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // loads .env
    DatabaseModule, UsersModule, AuthModule, CategoriesModule, FoodModule, BeverageModule, AdsModule,                           // connects MongoDB
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
