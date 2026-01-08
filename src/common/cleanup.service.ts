// src/common/cleanup.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ad } from '../ads/schemas/ads.schema';
import { Offer } from '../offers/schemas/offer.schema';
import { cloudinaryV2 } from '../common/cloudinary.config';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(
    @InjectModel(Ad.name) private adModel: Model<Ad>,
    @InjectModel(Offer.name) private offerModel: Model<Offer>,
  ) {}

  // runs every hour
  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    try {
      const now = new Date();

      // Ads: delete ads with endDate < now OR expireAt < now (fallback)
      const expiredAds = await this.adModel.find({
        $or: [
          { endDate: { $exists: true, $lt: now } },
          { expireAt: { $exists: true, $lt: now } },
        ],
      });

      for (const ad of expiredAds) {
        try {
          // attempt to delete cloudinary image if public id available
          const publicId = (ad as any).imagePublicId;
          if (publicId) {
            await cloudinaryV2.uploader.destroy(publicId);
            this.logger.log(`Deleted Cloudinary asset ${publicId} for ad ${ad._id}`);
          }
        } catch (err) {
          this.logger.warn(`Failed to delete cloudinary image for ad ${ad._id}: ${err.message}`);
        }
        await this.adModel.deleteOne({ _id: ad._id });
        this.logger.log(`Deleted expired ad ${ad._id}`);
      }

      // Offers: TTL index should remove them, but as a fallback remove offers with endDate < now
      const expiredOffers = await this.offerModel.find({
        $or: [
          { endDate: { $exists: true, $lt: now } },
          { expireAt: { $exists: true, $lt: now } },
        ],
      });

      for (const off of expiredOffers) {
        try {
          await this.offerModel.deleteOne({ _id: off._id });
          this.logger.log(`Deleted expired offer ${off._id}`);
        } catch (err) {
          this.logger.warn(`Failed to delete offer ${off._id}: ${err.message}`);
        }
      }

      this.logger.log('Cleanup job completed');
    } catch (err) {
      this.logger.error('Cleanup job error: ' + (err as Error).message);
    }
  }
}
