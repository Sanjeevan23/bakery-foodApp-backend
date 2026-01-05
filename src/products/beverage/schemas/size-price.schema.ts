// src/products/beverage/schemas/size-price.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class SizePrice {
  @Prop({ required: true })
  size: string; // e.g. "330ml", "500ml", "1L"

  @Prop({ required: true })
  price: number; // e.g. 1.2, 2.5
}

export const SizePriceSchema = SchemaFactory.createForClass(SizePrice);
