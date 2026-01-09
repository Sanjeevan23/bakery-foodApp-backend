import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CouponsService } from './coupons.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/roles.enum';
import { CreateCouponTemplateDto } from './dto/create-template.dto';
import { RedeemCouponDto } from './dto/redeem-coupon.dto';
import { SendCouponOtpDto } from './dto/send-otp.dto';
import { AssignToUserDto } from './dto/assign-to-user.dto';
import { DistributeRandomDto } from './dto/distribute-random.dto';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  // -------- ADMIN --------
  // POST /coupons/template
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('template')
  @UseInterceptors(FileInterceptor('image'))
  async createTemplate(
    @Body() body: CreateCouponTemplateDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Image file required under key "image"');

    // body.expiryDays already validated by DTO transform if using ValidationPipe globally,
    // but double-check
    const expiryDays = Number((body as any).expiryDays);
    if (Number.isNaN(expiryDays) || expiryDays < 1) {
      throw new BadRequestException('expiryDays must be a positive number');
    }
    const isActive = (body as any).isActive === undefined ? true : Boolean((body as any).isActive);

    return this.couponsService.createTemplateFromFile(file, { expiryDays, isActive });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('template')
  getAllTemplates() {
    return this.couponsService.getAllTemplates();
  }

  // Admin assigns template to a user
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('assign')
  assignToUser(@Body() body: AssignToUserDto) {
    const q = Number(body.quantity ?? 1);
    return this.couponsService.assignToUser(body.userId, body.templateId, q, Boolean(body.force));
  }

  // Admin: distribute randomly among provided userIds (each selected user gets one coupon)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('distribute-random')
  distributeRandom(@Body() body: DistributeRandomDto) {
    return this.couponsService.distributeRandom(body.templateId, body.userIds, body.count, Boolean(body.force));
  }

  // Admin: get all user coupons
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  getAllUserCoupons() {
    return this.couponsService.getAllUserCoupons();
  }

  // -------- USER --------
  // GET /coupons/my
  @UseGuards(JwtAuthGuard)
  @Get('my')
  getMyCoupons(@Req() req: any) {
    const userId = req.user?.sub ?? req.user?.userId;
    return this.couponsService.getMyCoupons(userId);
  }

  // -------- CASHIER --------
  // GET /coupons/by-phone/:phone
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CASHIER)
  @Get('by-phone/:phone')
  getByPhone(@Param('phone') phone: string) {
    return this.couponsService.getCouponsByPhone(phone);
  }

  // POST /coupons/send-otp  { couponId }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CASHIER)
  @Post('send-otp')
  async sendOtp(@Body() body: SendCouponOtpDto) {
    const res = await this.couponsService.sendOtpForCoupon(body.couponId);
    return res;
  }

  // POST /coupons/redeem { couponId, otp }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CASHIER)
  @Post('redeem')
  redeem(@Body() body: RedeemCouponDto) {
    return this.couponsService.redeemCoupon(body.couponId, body.otp);
  }
}
