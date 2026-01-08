import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LoyaltyService } from './loyalty.service';
import { LoyaltyController } from './loyalty.controller';
import { LoyaltyWallet, LoyaltyWalletSchema } from './schemas/loyalty-wallet.schema';
import { LoyaltyTransaction, LoyaltyTransactionSchema } from './schemas/loyalty-transaction.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LoyaltyWallet.name, schema: LoyaltyWalletSchema },
      { name: LoyaltyTransaction.name, schema: LoyaltyTransactionSchema },
    ]),
  ],
  providers: [LoyaltyService],
  controllers: [LoyaltyController],
  exports: [LoyaltyService],
})
export class LoyaltyModule {}
