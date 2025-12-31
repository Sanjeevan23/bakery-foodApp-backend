/** Ensures correct password input for logged-in users */

// src/auth/dto/change-password.dto.ts
import { IsNotEmpty, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty()
  currentPassword: string;

  @MinLength(6)
  newPassword: string;
}
