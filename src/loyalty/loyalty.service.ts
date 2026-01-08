import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LoyaltyWallet, LoyaltyWalletDocument } from './schemas/loyalty-wallet.schema';
import { LoyaltyTransaction, LoyaltyTransactionDocument } from './schemas/loyalty-transaction.schema';

@Injectable()
export class LoyaltyService {
  constructor(
    @InjectModel(LoyaltyWallet.name)
    private walletModel: Model<LoyaltyWalletDocument>,

    @InjectModel(LoyaltyTransaction.name)
    private txModel: Model<LoyaltyTransactionDocument>,
  ) {}

  // Ensure wallet exists
  async getOrCreateWallet(userId: string) {
    let wallet = await this.walletModel.findOne({ userId });
    if (!wallet) {
      wallet = await this.walletModel.create({ userId, totalPoints: 0 });
    }
    return wallet;
  }

  // Calculate earn points
  calculateEarnedPoints(amount: number): number {
    if (amount < 15) return 0;
    return 1 + Math.floor((amount - 15) / 10);
  }

  // Earn points
  async earnPoints(userId: string, orderId: string, orderAmount: number) {
    const points = this.calculateEarnedPoints(orderAmount);
    if (points <= 0) return null;

    const wallet = await this.getOrCreateWallet(userId);
    wallet.totalPoints += points;
    await wallet.save();

    await this.txModel.create({
      userId,
      orderId,
      type: 'earn',
      points,
      moneyValue: points,
      balanceAfter: wallet.totalPoints,
      description: `Earned from order £${orderAmount}`,
    });

    return points;
  }

  // Spend points
  async spendPoints(userId: string, orderId: string, pointsToUse: number) {
    const wallet = await this.getOrCreateWallet(userId);

    if (wallet.totalPoints < pointsToUse) {
      throw new BadRequestException('Not enough loyalty points');
    }

    wallet.totalPoints -= pointsToUse;
    await wallet.save();

    await this.txModel.create({
      userId,
      orderId,
      type: 'spend',
      points: pointsToUse,
      moneyValue: pointsToUse,
      balanceAfter: wallet.totalPoints,
      description: `Used for order discount`,
    });

    return wallet.totalPoints;
  }

  // Get wallet
  async getWallet(userId: string) {
    return this.getOrCreateWallet(userId);
  }

  // Get history
  async getHistory(userId: string) {
    return this.txModel.find({ userId }).sort({ createdAt: -1 });
  }

  // Admin: get any user's history
  async getHistoryByAdmin(userId: string) {
    return this.getHistory(userId);
  }
}
