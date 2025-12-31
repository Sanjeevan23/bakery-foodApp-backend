// src/users/users.controller.ts
import { Controller, Get, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllUsers(@Req() req: any) {
    return {
      loggedInUser: req.user, // contains sub and role
      users: await this.usersService.findAll(),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update-profile')
  async updateProfile(@Req() req: any, @Body() body: UpdateUserDto) {
    const userId = req.user.sub; // JWT user ID

    // Convert dob string to Date if exists
    const updateData = {
      ...body,
      dob: body.dob ? new Date(body.dob) : undefined,
    };
    return this.usersService.updateUser(userId, updateData);
  }
}
