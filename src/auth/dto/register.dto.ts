/* Prevents empty fields
   Prevents wrong data
   Protects backend*/

// src/auth/dto/register.dto.ts
import { IsDateString, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

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

  @IsDateString() // expects ISO date string; e.g. "2002-08-23"
  dob: string;

  @IsString()
  salutation: string;
}
