/** Ensures valid email before sending OTP */

// src/auth/dto/forgot-password-request.dto.ts
import { IsEmail } from 'class-validator';

export class ForgotPasswordRequestDto {
  @IsEmail()
  email: string;
}
