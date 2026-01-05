// src/products/beverage/dto/create-beverage.dto.ts
import { Type } from 'class-transformer';
import { IsString, IsArray, IsEnum, IsMongoId, IsNotEmpty, IsOptional, ValidateNested, ArrayMinSize } from 'class-validator';
import { SizePriceDto } from './size-price.dto';

export class CreateBeverageDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsOptional()
  @IsString()
  longDescription?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ingredients?: string[];

  @IsNotEmpty()
  @IsEnum(['alcoholic', 'non-alcoholic'])
  type: 'alcoholic' | 'non-alcoholic';

  // sizes example: [{size: "330ml", price: 1.2}, {size: "500ml", price: 2.5}]
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one size with price is required' })
  @ValidateNested({ each: true })
  @Type(() => SizePriceDto)
  sizes: SizePriceDto[];

  @IsNotEmpty()
  @IsMongoId()
  categoryId: string;

  @IsOptional()
  @IsString()
  categoryName?: string;

  @IsOptional()
  @IsString()
  image?: string;
}
