/* Prevents empty fields
   Prevents wrong data
   Protects backend*/

// src/auth/dto/register.dto.ts
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {

  @IsEmail()
  email: string;

  @IsString()
  username: string;

  @MinLength(6)
  password: string;

  @IsString()
  firstname: string;

  @IsString()
  lastname: string;

  @IsString()
  phone: string;
}
