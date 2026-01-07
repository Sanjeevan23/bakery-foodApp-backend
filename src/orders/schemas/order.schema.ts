// src/orders/schemas/order.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

/**
 * Address subdocument (embedded)
 */
@Schema({ _id: false })
export class Address {
  @Prop({ required: true })
  line1: string;

  @Prop()
  line2?: string;

  @Prop()
  city?: string;

  @Prop()
  postalCode?: string;

  @Prop()
  instruction?: string;
}
export const AddressSchema = SchemaFactory.createForClass(Address);

/**
 * Extra ingredient snapshot (embedded) - stored inside each order item
 */
@Schema({ _id: false })
export class ExtraSnapshot {
  @Prop({ type: Types.ObjectId, ref: 'ExtraIngredient', required: true })
  ingredientId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: number;
}
export const ExtraSnapshotSchema = SchemaFactory.createForClass(ExtraSnapshot);

/**
 * Order item snapshot (embedded)
 */
@Schema({ _id: false })
export class OrderItem {
  @Prop({ type: Types.ObjectId, required: true })
  productId: Types.ObjectId;

  @Prop({ required: true, enum: ['food', 'beverage'] })
  productType: 'food' | 'beverage';

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  unitPrice: number;

  @Prop({ required: true, default: 1 })
  quantity: number;

  @Prop({ type: [ExtraSnapshotSchema], default: [] })
  extras: ExtraSnapshot[];

  @Prop({ default: 0 })
  extrasTotal: number;

  @Prop({ required: true })
  lineTotal: number;
}
export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

/**
 * Main Order schema
 */
@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: [OrderItemSchema], default: [] })
  items: OrderItem[];

  @Prop({ required: true, enum: ['dine-in', 'takeaway', 'delivery'] })
  orderType: 'dine-in' | 'takeaway' | 'delivery';

  @Prop()
  paymentType?: string;

  @Prop({ required: true })
  subTotal: number;

  @Prop({ default: 0 })
  tax: number;

  @Prop({ default: 0 })
  loyaltyPointsUsed?: number;

  @Prop({ default: 0 })
  tip?: number;

  @Prop({ required: true })
  total: number;

  // address is an embedded subdocument (optional; required for delivery)
  @Prop({ type: AddressSchema, required: false })
  address?: Address;

  @Prop({ default: 'completed' })
  paymentStatus: string;

  @Prop({ default: 'pending' })
  orderStatus: string;

  @Prop({ default: '' })
  qrImageUrl?: string;

  @Prop({ default: false })
  isOtpVerifiedForCompletion?: boolean;
}

// TTL: auto delete orders after 7 days
export const OrderSchema = SchemaFactory.createForClass(Order);
OrderSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 });

// Optional: automatically delete orders after 7 days (uncomment if you want TTL).
// NOTE: TTL uses the document's `createdAt` field with an index. Use carefully.
// OrderSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7 * 24 * 3600 });


