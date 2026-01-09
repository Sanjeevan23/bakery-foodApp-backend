import { IsMongoId, IsString } from 'class-validator';

export class RedeemCouponDto {
  @IsMongoId()
  couponId: string;

  @IsString()
  otp: string;
}
