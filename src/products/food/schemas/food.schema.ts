// src/products/food/schemas/food.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FoodDocument = Food & Document;

@Schema({ timestamps: true })
export class Food {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ default: '' })
  shortDescription: string;

  @Prop({ default: '' })
  longDescription: string;

  @Prop({ type: [String], default: [] })
  ingredients: string[];

  @Prop({ required: true })
  price: number;

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: 0 })
  reviewCount: number;
  
  @Prop({ enum: ['halal', 'haram'], required: true })
  type: 'halal' | 'haram';

  @Prop({ default: '' })
  image: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  categoryId: Types.ObjectId;

  @Prop({ default: '' })
  categoryName: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const FoodSchema = SchemaFactory.createForClass(Food);
