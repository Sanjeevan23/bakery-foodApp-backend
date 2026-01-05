// src/products/beverage/dto/size-price.dto.ts
import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SizePriceDto {
  @IsNotEmpty()
  @IsString()
  size: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(0.001, { message: 'Price must be greater than 0' })
  price: number;
}
