import { IsArray } from 'class-validator';

export class UpdateTermsDto {
  @IsArray()
  termsOfService: string[];
}
