import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UsersService } from '../users/users.service';
import { CouponTemplate } from 'src/coupons/schemas/coupon-template.schema';
import { UserCoupon } from 'src/coupons/schemas/user-coupon.schema';

@Injectable()
export class CouponsCronService {
  private readonly logger = new Logger(CouponsCronService.name);

  constructor(
    @InjectModel(CouponTemplate.name) private readonly templateModel: Model<CouponTemplate>,
    @InjectModel(UserCoupon.name) private readonly userCouponModel: Model<UserCoupon>,
    private readonly usersService: UsersService,
  ) {}

  // Cron job: runs daily at midnight
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async distributeRandomlyDaily() {
    this.logger.log('Starting automatic daily coupon distribution');

    try {
      // Step 1: get all active templates
      const templates = await this.templateModel.find({ isActive: true });
      if (!templates.length) return this.logger.log('No active templates to distribute');

      // Step 2: get all active users
      const users = await this.usersService.findAll(); // implement method in UsersService
      if (!users.length) return this.logger.log('No active users found');

      // Step 3: loop through each template and randomly assign
      for (const tpl of templates) {
        const userIds = users.map((u) => u._id.toString());

        // shuffle userIds
        const shuffled = userIds.sort(() => 0.5 - Math.random());

        // pick a number of users to assign, e.g., 10% of users
        const count = Math.ceil(userIds.length * 0.1); // adjustable
        const selected = shuffled.slice(0, count);

        for (const uid of selected) {
          try {
            // check monthly cap (2 per month)
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            const monthCount = await this.userCouponModel.countDocuments({
              userId: new Types.ObjectId(uid),
              createdAt: { $gte: startOfMonth },
            });

            if (monthCount >= 2) continue; // skip if user reached limit

            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + tpl.expiryDays);

            await this.userCouponModel.create({
              userId: new Types.ObjectId(uid),
              templateId: tpl._id,
              imageUrl: tpl.imageUrl,
              expiryDate,
            });
          } catch (err) {
            this.logger.warn(`Failed to assign template ${tpl._id} to user ${uid}: ${err.message}`);
          }
        }
      }

      this.logger.log('Automatic coupon distribution completed');
    } catch (err) {
      this.logger.error(`Error in automatic coupon distribution: ${err.message}`);
    }
  }
}
