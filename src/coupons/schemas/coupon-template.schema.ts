import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class CouponTemplate extends Document {
  @Prop({ required: true })
  imageUrl: string;

  @Prop({ required: true })
  expiryDays: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const CouponTemplateSchema =
  SchemaFactory.createForClass(CouponTemplate);
