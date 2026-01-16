//src/auth/dto/request-otp.dto.ts

import { IsEmail, IsOptional, IsIn } from 'class-validator';

export class RequestOtpDto {
  @IsEmail()
  email: string;

  // purpose: 'register' or 'forgot'
  @IsOptional()
  @IsIn(['register', 'forgot'])
  purpose?: 'register' | 'forgot';
}
