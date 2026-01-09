import { IsOptional, IsString } from 'class-validator';

export class UpdateInfoDto {
  @IsOptional() @IsString()
  companyName?: string;

  @IsOptional() @IsString()
  phone?: string;

  @IsOptional() @IsString()
  landline?: string;

  @IsOptional() @IsString()
  email?: string;

  @IsOptional() @IsString()
  website?: string;

  @IsOptional() @IsString()
  aboutUs?: string;
}