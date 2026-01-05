// src/ads/dto/create-ad.dto.ts
import { IsBoolean, IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateAdDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
