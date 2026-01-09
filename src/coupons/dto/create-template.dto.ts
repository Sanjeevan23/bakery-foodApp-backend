// used only for validation of expiryDays and isActive (image comes from file)
import { IsBoolean, IsOptional, IsInt, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCouponTemplateDto {
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt({ message: 'expiryDays must be an integer' })
  @Min(1, { message: 'expiryDays must not be less than 1' })
  expiryDays: number;

  @IsOptional()
  @Transform(({ value }) => (value === 'true' || value === true))
  @IsBoolean()
  isActive?: boolean;
}
