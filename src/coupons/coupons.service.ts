import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CouponTemplate } from './schemas/coupon-template.schema';
import { UserCoupon } from './schemas/user-coupon.schema';
import { CouponOtp } from './schemas/coupon-otp.schema';
import { UsersService } from '../users/users.service';
import { cloudinaryV2 } from '../common/cloudinary.config';
import type { UploadApiResponse } from 'cloudinary';
import { CreateCouponTemplateDto } from './dto/create-template.dto';
import { sendOtpEmail } from 'src/common/email.service';

@Injectable()
export class CouponsService {
    constructor(
        @InjectModel(CouponTemplate.name)
        private readonly templateModel: Model<CouponTemplate>,

        @InjectModel(UserCoupon.name)
        private readonly userCouponModel: Model<UserCoupon>,

        @InjectModel(CouponOtp.name)
        private readonly otpModel: Model<CouponOtp>,

        private readonly usersService: UsersService,
    ) { }

    private async uploadFileToCloudinary(filePath: string): Promise<string> {
        const res: UploadApiResponse = await cloudinaryV2.uploader.upload(filePath, {
            folder: 'coupons',
            overwrite: true,
        });
        if (!res || !res.secure_url) throw new InternalServerErrorException('Cloudinary upload failed');
        return res.secure_url;
    }

    // ---- Admin: create template from uploaded file
    async createTemplateFromFile(file: Express.Multer.File, dto: { expiryDays: number; isActive?: boolean }) {
        const imageUrl = await this.uploadFileToCloudinary(file.path);
        const tpl = await this.templateModel.create({
            imageUrl,
            expiryDays: dto.expiryDays,
            isActive: dto.isActive ?? true,
        });
        return tpl;
    }

    async getAllTemplates() {
        return this.templateModel.find().sort({ createdAt: -1 });
    }

    // ---- Admin: assign template(s) to a specific user
    // quantity default 1. Observe per-month limit: max 2 coupons per user per calendar month unless force=true
    async assignToUser(userId: string, templateId: string, quantity = 1, force = false) {
        if (!Types.ObjectId.isValid(userId)) throw new BadRequestException('Invalid userId');
        if (!Types.ObjectId.isValid(templateId)) throw new BadRequestException('Invalid templateId');

        const user = await this.usersService.findById(userId);
        if (!user) throw new NotFoundException('User not found');

        const tpl = await this.templateModel.findById(templateId);
        if (!tpl || !tpl.isActive) throw new NotFoundException('Template not found or inactive');

        // check per-month cap
        if (!force) {
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);
            const monthCount = await this.userCouponModel.countDocuments({
                userId: new Types.ObjectId(userId),
                createdAt: { $gte: startOfMonth },
            });
            const allowed = Math.max(0, 2 - monthCount);
            if (allowed <= 0) throw new BadRequestException('User already has maximum 2 coupons this month');
            if (quantity > allowed) quantity = allowed;
        }

        const created: UserCoupon[] = [];
        for (let i = 0; i < quantity; i++) {
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + tpl.expiryDays);
            const uc = await this.userCouponModel.create({
                userId: new Types.ObjectId(userId),
                templateId: tpl._id,
                imageUrl: tpl.imageUrl,
                expiryDate,
            });
            created.push(uc);
        }

        return { totalAssigned: created.length, items: created };
    }

    // ---- Admin: distribute randomly among a provided list of userIds
    async distributeRandom(templateId: string, userIds: string[], count: number, force = false) {
        if (!Types.ObjectId.isValid(templateId)) throw new BadRequestException('Invalid templateId');

        const tpl = await this.templateModel.findById(templateId);
        if (!tpl || !tpl.isActive) throw new NotFoundException('Template not found or inactive');

        // sanitize userIds and filter existing users
        const validIds = userIds.filter((id) => Types.ObjectId.isValid(id));
        const users: string[] = [];
        for (const id of validIds) {
            try {
                const u = await this.usersService.findById(id);
                if (u) users.push(u._id.toString());
            } catch {
                // skip non-existent
            }
        }

        if (users.length === 0) throw new BadRequestException('No valid users to distribute');

        // shuffle & pick
        const shuffled = users.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, Math.min(count, shuffled.length));

        const assigned: UserCoupon[] = [];
        for (const uid of selected) {
            try {
                const res = await this.assignToUser(uid, templateId, 1, force);
                assigned.push(...res.items);
            } catch (err) {
                // skip assignment errors per-user (e.g., monthly cap)
            }
        }

        return { totalAssigned: assigned.length, items: assigned };
    }

    // ---- User: get my coupons (only active + not expired)
    async getMyCoupons(userId: string) {
        return this.userCouponModel.find({
            userId: new Types.ObjectId(userId),
            isActive: true,
            expiryDate: { $gt: new Date() },
        }).sort({ createdAt: -1 })
            .then((items) => ({ total: items.length, items }));
    }

    // ---- Admin: get all user coupons (with optional filters)
    async getAllUserCoupons() {
        const items = await this.userCouponModel.find().sort({ createdAt: -1 });
        return { total: items.length, items };
    }

    // ---- Cashier: find coupons by phone (uses UsersService.findByLogin(phone))
    async getCouponsByPhone(phone: string) {
        const user = await this.usersService.findByPhone(phone);
        const items = await this.userCouponModel.find({
            userId: user._id,
            expiryDate: { $gt: new Date() },
        }).sort({ createdAt: -1 });
        return { userId: user._id, total: items.length, items };
    }

    // ---- OTP: cashier requests OTP be sent to coupon owner
    async sendOtpForCoupon(couponId: string) {
        if (!Types.ObjectId.isValid(couponId)) throw new BadRequestException('Invalid couponId');
        const coupon = await this.userCouponModel.findById(couponId);
        if (!coupon) throw new NotFoundException('Coupon not found');

        if (!coupon.isActive) throw new BadRequestException('Coupon already used');

        // fetch owner email
        const user = await this.usersService.findById(coupon.userId.toString());
        if (!user || !user.email) throw new NotFoundException('Coupon owner not found or has no email');

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await this.otpModel.create({
            userId: coupon.userId,
            couponId: coupon._id,
            otp,
            expiresAt,
        });

        // send email to user (production: don't return OTP)
        sendOtpEmail(user.email, otp); // uncomment if email config set
        return { message: 'OTP created and will be emailed to coupon owner',
            //  otpForDev: otp
             };
    }

    // ---- Redeem: cashier redeems coupon by posting couponId + otp
    async redeemCoupon(couponId: string, otp: string) {
        if (!Types.ObjectId.isValid(couponId)) throw new BadRequestException('Invalid couponId');

        const otpRecord = await this.otpModel.findOne({
            couponId: new Types.ObjectId(couponId),
            otp,
            expiresAt: { $gt: new Date() },
        });

        if (!otpRecord) throw new BadRequestException('Invalid or expired OTP');

        const coupon = await this.userCouponModel.findById(couponId);
        if (!coupon) throw new NotFoundException('Coupon not found');

        coupon.isActive = false;
        coupon.usedAt = new Date();
        await coupon.save();

        await this.otpModel.deleteMany({ couponId: coupon._id });

        return { message: 'Coupon redeemed successfully' };
    }
}
