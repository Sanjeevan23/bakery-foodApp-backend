// src/ads/schemas/ads.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Ad extends Document {
  @Prop({ required: true })
  image: string;

  @Prop()
  title?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  endDate?: Date;
}

export const AdSchema = SchemaFactory.createForClass(Ad);
