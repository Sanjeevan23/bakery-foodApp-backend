// src/auth/auth.controller.ts
import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordRequestDto } from './dto/forgot-password-request.dto';
import { ForgotPasswordVerifyDto } from './dto/forgot-password-verify.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RequestOtpDto } from './dto/request-otp.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  // Sends OTP (register / forgot password)
  @Post('request-otp')
  requestOtp(@Body() body: RequestOtpDto) {
    // pass purpose through, default handled in service
    return this.authService.requestOtp(body.email, body.purpose ?? 'forgot');
  }
  // verify OTP (does not change password)
  @Post('verify-otp')
  verifyOtp(@Body() body: VerifyOtpDto) {
    return this.authService.verifyOtp(body.email, body.otp);
  }

  // Register user
  @Post('register')
  register(@Body() body: RegisterDto & { otp: string }) {
    return this.authService.register(body);
  }

  // Login
  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body.login, body.password);
  }

  // Forgot password – verify OTP and set new password
  @Post('forgot-password')
  forgotPassword(@Body() body: ForgotPasswordVerifyDto) {
    return this.authService.resetForgottenPassword(
      body.email,
      body.otp,
      body.newPassword,
    );
  }

  // Change password (logged-in user)
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  changePassword(@Req() req: any, @Body() body: ChangePasswordDto) {
    return this.authService.changePassword(
      req.user.sub,
      body.currentPassword,
      body.newPassword,
    );
  }
}
