//src/loyalty/loyalty-transaction.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LoyaltyTransactionDocument = LoyaltyTransaction & Document;

@Schema({ timestamps: true })
export class LoyaltyTransaction {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
  orderId: Types.ObjectId;

  @Prop({ enum: ['earn', 'spend'], required: true })
  type: 'earn' | 'spend';

  @Prop({ required: true })
  points: number;

  @Prop({ required: true })
  moneyValue: number;

  @Prop({ required: true })
  balanceAfter: number;

  @Prop()
  description: string;
}

export const LoyaltyTransactionSchema = SchemaFactory.createForClass(LoyaltyTransaction);
