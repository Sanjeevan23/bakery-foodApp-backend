//src/loyalty/dto/apply-loyalty.dto.ts
import { IsInt, Min } from 'class-validator';

export class ApplyLoyaltyDto {
  @IsInt()
  @Min(1)
  pointsToUse: number;
}
