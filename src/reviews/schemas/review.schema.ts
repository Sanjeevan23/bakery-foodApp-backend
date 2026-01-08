// src/reviews/schemas/review.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true })
export class Review {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Food', required: true })
  foodId: Types.ObjectId;

  @Prop({ type: Number, min: 1, max: 5 })
  star?: number;

  @Prop({ type: String, default: '' })
  feedback?: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

// ensure one review per user per food
ReviewSchema.index({ userId: 1, foodId: 1 }, { unique: true });
