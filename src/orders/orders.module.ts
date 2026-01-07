// src/orders/orders.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order, OrderSchema } from './schemas/order.schema';

// product / extras / user / otp schemas
import { Food, FoodSchema } from '../products/food/schemas/food.schema';
import { Beverage, BeverageSchema } from '../products/beverage/schemas/beverage.schema';
import { ExtraIngredient, ExtraIngredientSchema } from '../extra-ingredients/schemas/extra-ingredient.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Otp, OtpSchema } from '../auth/schemas/otp.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Food.name, schema: FoodSchema },
      { name: Beverage.name, schema: BeverageSchema },
      { name: ExtraIngredient.name, schema: ExtraIngredientSchema },
      { name: User.name, schema: UserSchema },
      { name: Otp.name, schema: OtpSchema },
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
