// src/products/beverage/schemas/beverage.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { SizePrice, SizePriceSchema } from './size-price.schema';

export type BeverageDocument = Beverage & Document;

@Schema({ timestamps: true })
export class Beverage {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ default: '' })
  shortDescription: string;

  @Prop({ default: '' })
  longDescription: string;

  @Prop({ type: [String], default: [] })
  ingredients: string[];

  // sizes array
  @Prop({ type: [SizePriceSchema], default: [] })
  sizes: SizePrice[];

  @Prop({ enum: ['alcoholic', 'non-alcoholic'], required: true })
  type: 'alcoholic' | 'non-alcoholic';

  @Prop({ default: '' })
  image: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  categoryId: Types.ObjectId;

  @Prop({ default: '' })
  categoryName: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const BeverageSchema = SchemaFactory.createForClass(Beverage);
