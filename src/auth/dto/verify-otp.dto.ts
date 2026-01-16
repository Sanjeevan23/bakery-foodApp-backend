// src/auth/dto/verify-otp.dto.ts
import { IsEmail, IsNotEmpty } from 'class-validator';

export class VerifyOtpDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  otp: string;
}
