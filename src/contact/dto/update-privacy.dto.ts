import { IsArray } from 'class-validator';

export class UpdatePrivacyDto {
  @IsArray()
  privacyPolicy: string[];
}
