import { IsArray, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsMongoId()
  @IsNotEmpty()
  productId!: string;

  @IsEnum(['food', 'beverage'])
  productType!: 'food' | 'beverage';

  @IsNumber()
  @Type(() => Number)
  @Min(1)
  quantity!: number;

  // optional unitPrice (frontend can pass unitPrice to snapshot)
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  unitPrice?: number;

  // extras are optional array of extra ingredient ids
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  extras?: string[];
}
