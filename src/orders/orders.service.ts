import {
    Injectable,
    NotFoundException,
    BadRequestException,
    InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { Food, FoodDocument } from '../products/food/schemas/food.schema';
import { Beverage, BeverageDocument } from '../products/beverage/schemas/beverage.schema';
import { ExtraIngredient } from '../extra-ingredients/schemas/extra-ingredient.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Otp, OtpDocument } from '../auth/schemas/otp.schema';
import * as QRCode from 'qrcode';
import { cloudinaryV2 } from '../common/cloudinary.config';
import { sendOtpEmail } from '../common/email.service';
import type { UploadApiResponse } from 'cloudinary';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderItemDto } from './dto/order-item.dto';
import { LoyaltyService } from '../loyalty/loyalty.service';

type ProductType = 'food' | 'beverage';

interface OrderItemExtraSnapshot {
    ingredientId: Types.ObjectId;
    name: string;
    price: number;
}

interface OrderItemSnapshot {
    productId: Types.ObjectId;
    productType: ProductType;
    name: string;
    unitPrice: number;
    quantity: number;
    extras: OrderItemExtraSnapshot[];
    extrasTotal: number;
    lineTotal: number;
}

@Injectable()
export class OrdersService {
    constructor(
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(Food.name) private foodModel: Model<FoodDocument>,
        @InjectModel(Beverage.name) private beverageModel: Model<BeverageDocument>,
        @InjectModel(ExtraIngredient.name) private extraModel: Model<ExtraIngredient>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Otp.name) private otpModel: Model<OtpDocument>,
        private readonly loyaltyService: LoyaltyService,
    ) { }

    // upload buffer to cloudinary using upload_stream with typed response
    private uploadBufferToCloudinary(buffer: Buffer, folder = 'orders/qr'): Promise<string> {
        return new Promise((resolve, reject) => {
            const stream = cloudinaryV2.uploader.upload_stream(
                { folder, overwrite: true },
                (error: Error | undefined, result?: UploadApiResponse) => {
                    if (error) return reject(error);
                    if (!result || !result.secure_url) return reject(new Error('Cloudinary upload failed'));
                    resolve(result.secure_url);
                },
            );
            stream.end(buffer);
        });
    }

    // create order (typed dto)
    async createOrder(userId: string, dto: CreateOrderDto) {
        if (!Types.ObjectId.isValid(userId)) throw new BadRequestException('Invalid user id');
        const user = await this.userModel.findById(userId).select('email');
        if (!user) throw new NotFoundException('User not found');

        if (!dto.items || !Array.isArray(dto.items) || dto.items.length === 0) {
            throw new BadRequestException('Order must have at least one item');
        }
        // ensure address is present for delivery orders
        if (dto.orderType === 'delivery') {
            if (!dto.address) {
                throw new BadRequestException('address is required for delivery orders');
            }
            // you can also validate address fields further if needed (line1, city etc.)
        }

        // Validate loyalty usage pre-checks (before creating order)
        const pointsToUse = Number(dto.loyaltyPointsUsed ?? 0);
        if (pointsToUse && pointsToUse > 0) {
            // only dine-in & takeaway allowed
            if (!['dine-in', 'takeaway'].includes(dto.orderType)) {
                throw new BadRequestException('Loyalty points can only be used for dine-in or takeaway orders');
            }
            // min order threshold to apply loyalty
            if (Number(dto.subTotal) < 10) {
                throw new BadRequestException('Minimum order subtotal £10 required to use loyalty points');
            }
            // ensure totals numeric & consistent
            if (isNaN(Number(dto.total))) {
                throw new BadRequestException('Invalid total');
            }
            if (pointsToUse > Number(dto.total)) {
                throw new BadRequestException('Loyalty points used cannot exceed order total');
            }

            // ensure wallet has enough points
            const wallet = await this.loyaltyService.getOrCreateWallet(userId);
            if (wallet.totalPoints < pointsToUse) {
                throw new BadRequestException('Not enough loyalty points');
            }
        }

        const itemsProcessed: OrderItemSnapshot[] = [];

        for (const itemRaw of dto.items as OrderItemDto[]) {
            // productId validation
            if (!itemRaw.productId || !Types.ObjectId.isValid(itemRaw.productId)) {
                throw new BadRequestException('Invalid productId in items');
            }
            const prodId = new Types.ObjectId(itemRaw.productId);

            // productType normalization
            const productType: ProductType = itemRaw.productType === 'beverage' ? 'beverage' : 'food';

            // fetch product document
            let productDoc: FoodDocument | BeverageDocument | null = null;
            if (productType === 'food') {
                productDoc = await this.foodModel.findById(prodId).select('name price');
                if (!productDoc) throw new BadRequestException('Product ID does not belong to a food item');
            } else {
                productDoc = await this.beverageModel.findById(prodId).select('name sizes price');
                if (!productDoc) throw new BadRequestException('Product ID does not belong to a beverage item');
            }

            // extras validation & snapshot
            const extrasSnapshot: OrderItemExtraSnapshot[] = [];
            let extrasTotal = 0;
            if (itemRaw.extras) {
                if (!Array.isArray(itemRaw.extras)) {
                    throw new BadRequestException('extras must be an array of extra ingredient ids');
                }
                for (const extraIdRaw of itemRaw.extras) {
                    if (!Types.ObjectId.isValid(extraIdRaw)) {
                        throw new BadRequestException('Invalid extra ingredient id');
                    }
                    const extraDoc = await this.extraModel.findById(new Types.ObjectId(extraIdRaw)).select('name price');
                    if (!extraDoc) throw new BadRequestException('Extra ingredient not found: ' + extraIdRaw);
                    extrasSnapshot.push({
                        ingredientId: extraDoc._id,
                        name: extraDoc.name,
                        price: extraDoc.price,
                    });
                    extrasTotal += Number(extraDoc.price);
                }
            }

            const quantity = Number(itemRaw.quantity ?? 1);
            if (Number.isNaN(quantity) || quantity <= 0) {
                throw new BadRequestException('Invalid quantity for item: must be >= 1');
            }

            // unit price: prefer client-provided unitPrice BUT validate. If not sent, use product price.
            const unitPriceCandidate = itemRaw.hasOwnProperty('unitPrice') ? Number((itemRaw).unitPrice) : undefined;
            const unitPrice = unitPriceCandidate !== undefined && !Number.isNaN(unitPriceCandidate)
                ? unitPriceCandidate
                : Number((productDoc as { price?: number }).price ?? 0);

            if (Number.isNaN(unitPrice) || unitPrice < 0) {
                throw new BadRequestException('Invalid unit price for item');
            }

            const lineTotal = quantity * unitPrice + extrasTotal;

            const snapshot: OrderItemSnapshot = {
                productId: prodId,
                productType,
                name: productDoc.name,
                unitPrice,
                quantity,
                extras: extrasSnapshot,
                extrasTotal,
                lineTotal,
            };

            itemsProcessed.push(snapshot);
        } // end items loop

        // totals sanity
        const subTotal = Number(dto.subTotal);
        const tax = Number(dto.tax);
        const total = Number(dto.total);
        if ([subTotal, tax, total].some((v) => Number.isNaN(v))) {
            throw new BadRequestException('Invalid numeric totals');
        }

        // create order doc
        const orderDoc = await this.orderModel.create({
            user: new Types.ObjectId(userId),
            items: itemsProcessed,
            orderType: dto.orderType,
            paymentType: dto.paymentType,
            subTotal,
            tax,
            loyaltyPointsUsed: pointsToUse ?? 0,
            tip: dto.tip ?? 0,
            total,
            address: dto.address ?? undefined,
            paymentStatus: 'completed',
            orderStatus: 'pending',
        });

        // generate & upload QR
        try {
            const qrBuffer = await QRCode.toBuffer(orderDoc._id.toString());
            const qrUrl = await this.uploadBufferToCloudinary(qrBuffer, 'orders/qr');
            orderDoc.qrImageUrl = qrUrl;
            await orderDoc.save();
        } catch (err) {
            // QR generation/upload error should not block order creation; just log and continue
            // but we still keep order
            // if you want to fail the whole transaction, throw error here
            console.error('QR generation/upload failed', err);
        }

        // If loyalty points were used, deduct and log now (link to created order)
        if (pointsToUse && pointsToUse > 0) {
            try {
                await this.loyaltyService.spendPoints(userId, orderDoc._id.toString(), pointsToUse);
            } catch (err) {
                // rollback created order if spend fails (to avoid inconsistent state)
                await this.orderModel.findByIdAndDelete(orderDoc._id);
                throw new BadRequestException('Failed to apply loyalty points: ' + (err.message || err.toString()));
            }
        }
        return orderDoc;
    }

    async findById(id: string) {
        if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid order id');
        const found = await this.orderModel.findById(id);
        if (!found) throw new NotFoundException('Order not found');
        return found;
    }

    async findByUser(userId: string) {
        if (!Types.ObjectId.isValid(userId)) throw new BadRequestException('Invalid user id');
        const items = await this.orderModel.find({ user: new Types.ObjectId(userId) }).sort({ createdAt: -1 });
        return { total: items.length, items };
    }

    async findAll(requesterRole?: string, requesterUserId?: string) {
        const staffRoles = ['admin', 'cashier', 'delivery'];
        if (requesterRole && staffRoles.includes(requesterRole)) {
            const items = await this.orderModel.find().sort({ createdAt: -1 });
            return { total: items.length, items };
        }
        if (!requesterUserId) throw new BadRequestException('User id required');
        return this.findByUser(requesterUserId);
    }

    async requestComplete(orderId: string) {
        const order = await this.findById(orderId);
        if (order.orderStatus !== 'pending') {
            throw new BadRequestException('Order not pending');
        }

        const owner = await this.userModel.findById(order.user).select('email');
        if (!owner) throw new NotFoundException('Order owner not found');

        const otpPlain = Math.floor(100000 + Math.random() * 900000).toString();

        await this.otpModel.deleteMany({ email: owner.email });
        await this.otpModel.create({
            email: owner.email,
            otp: otpPlain,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        });

        await sendOtpEmail(owner.email, otpPlain);
        return { message: 'OTP sent to order owner email' };
    }

    async completeOrder(orderId: string, otpPlain: string) {
        const order = await this.findById(orderId);
        if (order.orderStatus !== 'pending') {
            throw new BadRequestException('Order is not pending');
        }

        const owner = await this.userModel.findById(order.user).select('email');
        if (!owner) throw new NotFoundException('Order owner not found');

        const otpRecord = await this.otpModel.findOne({
            email: owner.email,
            otp: otpPlain,
            expiresAt: { $gt: new Date() },
        });

        if (!otpRecord) throw new BadRequestException('Invalid or expired OTP');

        order.orderStatus = 'completed';
        order.isOtpVerifiedForCompletion = true;
        await order.save();

        // Delete OTPs
        await this.otpModel.deleteMany({ email: owner.email });

        // AWARD LOYALTY POINTS ON COMPLETION (only when order total >= 15)
        try {
            const totalNum = Number(order.subTotal ?? 0);
            if (!Number.isNaN(totalNum) && totalNum >= 15) {
                // order.user can be ObjectId; convert to string
                await this.loyaltyService.earnPoints(order.user.toString(), order._id.toString(), totalNum);
            }
        } catch (err) {
            // non-fatal: log and continue
            console.error('Failed to award loyalty points on order completion', err);
        }

        return { message: 'Order completed' };
    }

    async deleteOrder(orderId: string) {
        if (!Types.ObjectId.isValid(orderId)) throw new BadRequestException('Invalid order id');
        const res = await this.orderModel.findByIdAndDelete(orderId);
        if (!res) throw new NotFoundException('Order not found');
        return { message: 'Order deleted' };
    }
}
