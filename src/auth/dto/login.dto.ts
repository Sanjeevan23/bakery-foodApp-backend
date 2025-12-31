// src/auth/dto/login.dto.ts
import { IsNotEmpty } from 'class-validator';

export class LoginDto {

  @IsNotEmpty()
  login: string; // email or username

  @IsNotEmpty()
  password: string;
}
