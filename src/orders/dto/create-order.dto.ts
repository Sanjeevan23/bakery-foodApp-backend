// src/orders/dto/create-order.dto.ts
import {
  IsArray,
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderItemDto } from './order-item.dto';
import { AddressDto } from './address.dto';

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsEnum(['dine-in', 'takeaway', 'delivery'])
  orderType: 'dine-in' | 'takeaway' | 'delivery';

  @IsString()
  paymentType: string;

  @IsNumber()
  @Type(() => Number)
  subTotal: number;

  @IsNumber()
  @Type(() => Number)
  tax: number;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  total: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  loyaltyPointsUsed?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  tip?: number;

  // Address is required WHEN orderType === 'delivery'
  @ValidateIf(o => o.orderType === 'delivery')
  @IsDefined()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;
}
