// src/orders/orders.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Param,
  BadRequestException,
  Delete,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/roles.enum';
import { CompleteOrderDto } from './dto/complete-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Create order (customer) – token required
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req: any, @Body() dto: CreateOrderDto) {
    const userId = req.user?.sub ?? req.user?.userId;
    if (!userId) throw new BadRequestException('Invalid token (no user id)');
    return this.ordersService.createOrder(userId, dto);
  }

  // GET /orders
  // If staff role => return all orders, otherwise return user's orders
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll(@Req() req: any) {
    const userId = req.user?.sub ?? req.user?.userId;
    const role = req.user?.role;
    return this.ordersService.findAll(role, userId);
  }

  // GET /orders/my
  @UseGuards(JwtAuthGuard)
  @Get('my')
  async myOrders(@Req() req: any) {
    const userId = req.user?.sub ?? req.user?.userId;
    return this.ordersService.findByUser(userId);
  }

  // GET /orders/:id
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOne(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.sub ?? req.user?.userId;
    const role = req.user?.role;
    const order = await this.ordersService.findById(id);

    // allow owner OR staff
    if (order.user.toString() !== userId) {
      const allowedRoles = [Role.ADMIN, Role.CASHIER, Role.DELIVERY];
      if (!allowedRoles.includes(role)) {
        throw new BadRequestException('Not permitted to view this order');
      }
    }
    return order;
  }

  // Cashier/Delivery/Admin request OTP to customer's email
  // Path requested: POST /orders/request-complete/:id
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CASHIER, Role.DELIVERY, Role.ADMIN)
  @Post('request-complete/:id')
  async requestComplete(@Param('id') id: string) {
    return this.ordersService.requestComplete(id);
  }

  // Cashier/Delivery/Admin complete the order by posting OTP
  // Path requested: POST /orders/complete/:id
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CASHIER, Role.DELIVERY, Role.ADMIN)
  @Post('complete/:id')
  async complete(@Param('id') id: string, @Body() body: CompleteOrderDto) {
    return this.ordersService.completeOrder(id, body.otp);
  }

  // Admin delete order
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.ordersService.deleteOrder(id);
  }
}
