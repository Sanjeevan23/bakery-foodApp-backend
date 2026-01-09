import { IsMongoId } from 'class-validator';

export class SendCouponOtpDto {
  @IsMongoId()
  couponId: string;
}
