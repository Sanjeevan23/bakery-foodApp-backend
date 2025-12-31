/** Routes only admin can access, uses JWT + RolesGuard. */

// src/admin/admin.controller.ts
import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/common/roles.enum';

@Controller('admin')
export class AdminController {
  constructor(private readonly usersService: UsersService) {}

  // Only admin can create cashier
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('create-cashier')
  async createCashier(@Body() body: any, @Req() req: any) {
    const hashedPassword = await bcrypt.hash(body.password, 10);
    return this.usersService.create({
      email: body.email,
      username: body.username,
      password: hashedPassword,
      role: Role.CASHIER,
    });
  }

  // Only admin can create delivery
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('create-delivery')
  async createDelivery(@Body() body: any, @Req() req: any) {
    const hashedPassword = await bcrypt.hash(body.password, 10);
    return this.usersService.create({
      email: body.email,
      username: body.username,
      firstname: body.firstname,
      lastname: body.lastname,
      password: hashedPassword,
      role: Role.DELIVERY,
    });
  }
}
