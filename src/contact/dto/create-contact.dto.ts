import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateContactDto {
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

  @IsOptional() @IsArray()
  termsOfService?: string[];

  @IsOptional() @IsArray()
  privacyPolicy?: string[];
}