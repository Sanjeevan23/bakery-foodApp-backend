import { Module, forwardRef } from '@nestjs/common';
import { CouponsController } from './coupons.controller';
import { CouponsService } from './coupons.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CouponTemplate, CouponTemplateSchema } from './schemas/coupon-template.schema';
import { UserCoupon, UserCouponSchema } from './schemas/user-coupon.schema';
import { CouponOtp, CouponOtpSchema } from './schemas/coupon-otp.schema';
import { MulterModule } from '@nestjs/platform-express';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CouponTemplate.name, schema: CouponTemplateSchema },
      { name: UserCoupon.name, schema: UserCouponSchema },
      { name: CouponOtp.name, schema: CouponOtpSchema },
    ]),
    MulterModule.register({ dest: './uploads/coupons' }),
    // UsersModule exports UsersService — import it so CouponsService can use it
    forwardRef(() => UsersModule),
  ],
  controllers: [CouponsController],
  providers: [CouponsService],
  exports: [CouponsService],
})
export class CouponsModule {}
