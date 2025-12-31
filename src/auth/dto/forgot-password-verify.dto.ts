/** Ensures OTP and password are valid */

//src/auth/dto/forgot-password-verify.dto.ts
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class ForgotPasswordVerifyDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  otp: string;

  @MinLength(6)
  newPassword: string;
}
