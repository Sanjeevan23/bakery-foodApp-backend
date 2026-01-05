// src/products/beverage/dto/update-beverage.dto.ts
import { IsOptional, IsString, IsArray, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SizePriceDto } from './size-price.dto';

export class UpdateBeverageDto {
  @IsOptional()
  @IsString()
  name?: string;

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

  @IsOptional()
  @IsEnum(['alcoholic', 'non-alcoholic'])
  type?: 'alcoholic' | 'non-alcoholic';

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SizePriceDto)
  sizes?: SizePriceDto[];

  @IsOptional()
  @IsString()
  image?: string;
}
