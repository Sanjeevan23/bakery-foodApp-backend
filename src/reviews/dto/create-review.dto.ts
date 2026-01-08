// src/reviews/dto/create-review.dto.ts
import { IsMongoId, IsOptional, IsString, IsInt, Min, Max } from 'class-validator';

export class CreateReviewDto {
  @IsMongoId()
  foodId!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  star?: number;

  @IsOptional()
  @IsString()
  feedback?: string;
}
