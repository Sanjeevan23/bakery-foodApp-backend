import { IsMongoId, IsArray, IsInt, Min, IsOptional, ArrayNotEmpty } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class DistributeRandomDto {
  @IsMongoId()
  templateId: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true })
  userIds: string[]; // pool of user ids to sample from

  @IsInt()
  @Type(() => Number)
  @Min(1)
  count: number; // how many users from the pool should receive 1 coupon each

  @IsOptional()
  @Transform(({ value }) => (value === 'true' || value === true))
  force?: boolean;
}
