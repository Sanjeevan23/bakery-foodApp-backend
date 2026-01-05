// src/categories/categories.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';

@Injectable()
export class CategoriesService {
  constructor(@InjectModel(Category.name) private categoryModel: Model<CategoryDocument>) { }

  async findAll(): Promise<{ total: number; items: Category[] }> {
    const items = await this.categoryModel.find().sort({ name: 1 });
    return {
      total: items.length,
      items,
    };
  }

  async findById(id: string): Promise<Category> {
    const category = await this.categoryModel.findById(id);
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async createCategory(name: string, imageUrl?: string): Promise<Category> {
    const category = new this.categoryModel({ name, image: imageUrl || null });
    return category.save();
  }

  async updateCategory(id: string, name?: string, imageUrl?: string): Promise<Category> {
    const category = await this.categoryModel.findById(id);
    if (!category) throw new NotFoundException('Category not found');

    if (name) category.name = name;
    if (imageUrl) category.image = imageUrl;

    return category.save();
  }

  async deleteCategory(id: string): Promise<{ message: string }> {
    const result = await this.categoryModel.deleteOne({ _id: id });
    if (result.deletedCount === 0) throw new NotFoundException('Category not found');
    return { message: 'Category deleted successfully' };
  }
}
