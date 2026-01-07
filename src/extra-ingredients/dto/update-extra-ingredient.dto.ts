// src/extra-ingredients/dto/update-extra-ingredient.dto.ts
import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateExtraIngredientDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
