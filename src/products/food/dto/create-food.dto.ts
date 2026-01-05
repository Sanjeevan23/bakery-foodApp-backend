// src/products/food/create-food.dto.ts
import { Type } from 'class-transformer';
import { IsString, IsArray, IsEnum, IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateFoodDto {

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    shortDescription: string;

    @IsOptional()
    @IsString()
    longDescription: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    ingredients: string[];

    @IsNotEmpty()
    @Type(() => Number)
    price: number;

    @IsNotEmpty()
    @IsEnum(['halal', 'haram'])
    type: 'halal' | 'haram';

    @IsNotEmpty()
    @IsMongoId()
    categoryId: string;

    @IsOptional()
    @IsString()
    categoryName: string;

    @IsOptional()
    @IsString()
    image?: string;
}
