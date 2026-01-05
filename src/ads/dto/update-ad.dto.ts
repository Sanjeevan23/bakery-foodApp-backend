// src/ads/dto/update-ad.dto.ts
import { IsBoolean, IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdateAdDto {
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
