/* Service talks to database
   Controller should NEVER access database directly */

//src/users/users.service.ts
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  // Returns all users without passwords
  async findAll() {
    return this.userModel.find().select('-password');
  }

  // Finds user by email or username
  async findByLogin(login: string) {
    return this.userModel.findOne({
      $or: [{ email: login }, { username: login }],
    });
  }

  // Finds user by ID
  async findById(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // Creates a new user
  async create(data: Partial<User>) {
    const exists = await this.userModel.findOne({
      $or: [{ email: data.email }, { username: data.username }],
    });

    if (exists) {
      throw new ConflictException('Email or username already exists');
    }

    return this.userModel.create(data);
  }

  // Updates password using email (forgot password)
  async updatePasswordByEmail(email: string, password: string) {
    await this.userModel.updateOne({ email }, { password });
  }

  // Updates password using user ID
  async updatePasswordById(userId: string, password: string) {
    await this.userModel.updateOne({ _id: userId }, { password });
  }

  // Updates allowed profile fields for a user (username/email/password NOT changed here)
  async updateUser(userId: string, data: Partial<User>) {
    // Block username, email, password updates via this route.
    const { username, email, password, ...allowedFields } = data as any;

    await this.userModel.updateOne({ _id: userId }, { $set: allowedFields });

    const updated = await this.userModel.findById(userId).select('-password');
    if (!updated) throw new NotFoundException('User not found after update');
    return updated;
  }
}
