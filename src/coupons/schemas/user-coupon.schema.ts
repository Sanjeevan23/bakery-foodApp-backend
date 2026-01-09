import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class UserCoupon extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'CouponTemplate', required: true })
  templateId: Types.ObjectId;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ required: true })
  expiryDate: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  usedAt?: Date;
}

export const UserCouponSchema = SchemaFactory.createForClass(UserCoupon);

// TTL: when usedAt is set, Mongo will delete document after usedAt + 7 days
UserCouponSchema.index({ usedAt: 1 }, { expireAfterSeconds: 7 * 24 * 3600 });
