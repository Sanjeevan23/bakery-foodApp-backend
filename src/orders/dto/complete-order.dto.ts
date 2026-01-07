// src/orders/dto/complete-order.dto.ts
import { IsNotEmpty } from 'class-validator';

export class CompleteOrderDto {
  @IsNotEmpty()
  otp: string;
}
