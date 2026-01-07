// src/orders/dto/address.dto.ts
import { IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class AddressDto {
  @IsNotEmpty()
  @IsString()
  line1: string; // required for delivery

  @IsOptional()
  @IsString()
  line2?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  instruction?: string; // delivery instructions
}
