/* Password is encrypted
   Login checks password
   JWT token created*/

// src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from '../users/users.service';
import { Otp, OtpDocument } from './schemas/otp.schema';
import { sendOtpEmail } from '../common/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectModel(Otp.name)
    private readonly otpModel: Model<OtpDocument>,
  ) { }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async requestOtp(email: string) {
    const otp = this.generateOtp();
    await this.otpModel.deleteMany({ email });

    await this.otpModel.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await sendOtpEmail(email, otp);
    return { message: 'OTP sent to email' };
  }

  async register(data: {
    email: string;
    username: string;
    password: string;
    firstname: string;
    lastname: string;
    phone: string;
    otp: string;
  }) {
    const otpRecord = await this.otpModel.findOne({
      email: data.email,
      otp: data.otp,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    await this.usersService.create({
      email: data.email,
      username: data.username,
      password: hashedPassword,
      firstname: data.firstname,
      lastname: data.lastname,
      phone: data.phone,
      role: 'customer',
    });

    await this.otpModel.deleteMany({ email: data.email });

    return { message: 'Registration successful' };
  }

  // LOGIN: returns access_token and minimal user info
  async login(login: string, password: string) {
    const user = await this.usersService.findByLogin(login);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user._id.toString(),
      role: user.role,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user._id.toString(),
        firstname: user.firstname ?? '',
        lastname: user.lastname ?? '',
        email: user.email,
        username: user.username,
        role: user.role,
        phone: user.phone,
      },
    };
  }

  async resetForgottenPassword(
    email: string,
    otp: string,
    newPassword: string,
  ) {
    const otpRecord = await this.otpModel.findOne({
      email,
      otp,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.usersService.updatePasswordByEmail(email, hashedPassword);

    await this.otpModel.deleteMany({ email });

    return { message: 'Password reset successful' };
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.usersService.findById(userId);

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.updatePasswordById(userId, hashedPassword);

    return { message: 'Password updated successfully' };
  }
}
