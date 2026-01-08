// This stores the current balance.
//src/loyalty/loyalty-wallet.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LoyaltyWalletDocument = LoyaltyWallet & Document;

@Schema({ timestamps: true })
export class LoyaltyWallet {
  @Prop({ type: Types.ObjectId, ref: 'User', unique: true, required: true })
  userId: Types.ObjectId;

  @Prop({ default: 0 })
  totalPoints: number;
}

export const LoyaltyWalletSchema = SchemaFactory.createForClass(LoyaltyWallet);
