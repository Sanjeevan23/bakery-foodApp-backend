//src/extra-ingredients/extra-ingredients.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ExtraIngredient,
  ExtraIngredientSchema,
} from './schemas/extra-ingredient.schema';
import { ExtraIngredientsController } from './extra-ingredients.controller';
import { ExtraIngredientsService } from './extra-ingredients.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ExtraIngredient.name, schema: ExtraIngredientSchema },
    ]),
  ],
  controllers: [ExtraIngredientsController],
  providers: [ExtraIngredientsService],
  exports: [ExtraIngredientsService],
})
export class ExtraIngredientsModule {}