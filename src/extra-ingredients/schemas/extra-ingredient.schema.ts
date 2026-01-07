// src/extra-ingredients/schemas/extra-ingredient.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ExtraIngredient extends Document {
  @Prop({ required: true, unique: true })
  name: string; // "Extra Cheese"

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const ExtraIngredientSchema =
  SchemaFactory.createForClass(ExtraIngredient);
