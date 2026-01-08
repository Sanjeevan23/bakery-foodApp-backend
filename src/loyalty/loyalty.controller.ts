import { Controller, Get, UseGuards, Req, Param } from '@nestjs/common';
import { LoyaltyService } from './loyalty.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/roles.enum';

@Controller('loyalty')
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  // Customer: get wallet
  @UseGuards(JwtAuthGuard)
  @Get('wallet')
  async myWallet(@Req() req: any) {
    const userId = req.user.sub;
    return this.loyaltyService.getWallet(userId);
  }

  // Customer: get own history
  @UseGuards(JwtAuthGuard)
  @Get('history')
  async myHistory(@Req() req: any) {
    const userId = req.user.sub;
    return this.loyaltyService.getHistory(userId);
  }

  // Admin: view any user's history
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('history/:uid')
  async historyByAdmin(@Param('uid') uid: string) {
    return this.loyaltyService.getHistoryByAdmin(uid);
  }
}
