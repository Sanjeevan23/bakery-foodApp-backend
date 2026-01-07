// src/extra-ingredients/dto/create-extra-ingredient.dto.ts
import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateExtraIngredientDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
