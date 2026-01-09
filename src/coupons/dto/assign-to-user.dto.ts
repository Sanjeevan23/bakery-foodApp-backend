import { IsMongoId, IsOptional, IsInt, Min, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class AssignToUserDto {
  @IsMongoId()
  userId: string;

  @IsMongoId()
  templateId: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  quantity?: number; // how many coupons to assign (default 1)

  @IsOptional()
  @Transform(({ value }) => (value === 'true' || value === true))
  @IsBoolean()
  force?: boolean; // bypass per-month limit
}
