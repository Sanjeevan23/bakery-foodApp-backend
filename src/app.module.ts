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
import { PopularProductsModule } from './popular-products/popular-products.module';
import { FavouriteProductsModule } from './favourite-products/favourite-products.module';
import { OffersModule } from './offers/offers.module';
import { TaxesModule } from './taxes/taxes.module';
import { ExtraIngredientsModule } from './extra-ingredients/extra-ingredients.module';
import { OrdersModule } from './orders/orders.module';
import { LoyaltyModule } from './loyalty/loyalty.module';
import { ReviewsModule } from './reviews/reviews.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // loads .env
    DatabaseModule, UsersModule, AuthModule, CategoriesModule, FoodModule, BeverageModule, AdsModule, PopularProductsModule, FavouriteProductsModule, OffersModule, TaxesModule, ExtraIngredientsModule, OrdersModule, LoyaltyModule, ReviewsModule,                           // connects MongoDB
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
