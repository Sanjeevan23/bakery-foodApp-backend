import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { Food, FoodDocument } from '../products/food/schemas/food.schema';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(Food.name) private foodModel: Model<FoodDocument>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  /**
   * Create or update a review (one review per user per food).
   * If a user posts again, the previous review is replaced (timestamp updated).
   */
  async addOrUpdateReview(userId: string, dto: { foodId: string; star?: number; feedback?: string }) {
    if (!Types.ObjectId.isValid(userId)) throw new BadRequestException('Invalid user id');
    if (!Types.ObjectId.isValid(dto.foodId)) throw new BadRequestException('Invalid foodId');

    // require at least star or feedback
    if ((dto.star === undefined || dto.star === null) && (!dto.feedback || dto.feedback.trim() === '')) {
      throw new BadRequestException('Either star or feedback is required');
    }

    // validate food exists
    const food = await this.foodModel.findById(dto.foodId);
    if (!food) throw new NotFoundException('Food not found');

    // upsert review (replace existing)
    const filter = { userId: new Types.ObjectId(userId), foodId: new Types.ObjectId(dto.foodId) };
    const update = {
      $set: {
        star: dto.star,
        feedback: dto.feedback ? dto.feedback.trim() : '',
        updatedAt: new Date(),
      },
      $setOnInsert: {
        createdAt: new Date(),
      },
    };

    // using findOneAndUpdate with upsert ensures one document per user-food
    const review = await this.reviewModel.findOneAndUpdate(filter, update, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    });

    // recompute rating & count for the food and update food doc
    await this.recomputeFoodRating(dto.foodId);

    return review;
  }

  /** get reviews for a food, newest first, plus basic user info (profile image / name) */
  async getByFood(foodId: string) {
    if (!Types.ObjectId.isValid(foodId)) throw new BadRequestException('Invalid foodId');

    // populate user info
    const reviews = await this.reviewModel
      .find({ foodId: new Types.ObjectId(foodId) })
      .sort({ updatedAt: -1 })
      .populate('userId', 'firstname lastname profileImage')
      .lean();

    // return mapped shape
    const mapped = reviews.map((r: any) => ({
      id: r._id,
      user: {
        id: r.userId?._id,
        firstname: r.userId?.firstname || '',
        lastname: r.userId?.lastname || '',
        profileImage: r.userId?.profileImage || null,
      },
      star: r.star ?? null,
      feedback: r.feedback ?? '',
      updatedAt: r.updatedAt,
      createdAt: r.createdAt,
    }));

    // Also return summary (avg star & count) computed from db for accuracy
    const agg = await this.reviewModel.aggregate([
      { $match: { foodId: new Types.ObjectId(foodId) } },
      {
        $group: {
          _id: '$foodId',
          avgStar: { $avg: '$star' },
          count: { $sum: 1 },
        },
      },
    ]);

    const summary = agg[0]
      ? {
          average: agg[0].avgStar ? Number(agg[0].avgStar.toFixed(2)) : 0,
          count: agg[0].count,
        }
      : { average: 0, count: 0 };

    return { summary, reviews: mapped };
  }

  async getAll() {
    const reviews = await this.reviewModel.find().sort({ updatedAt: -1 }).populate('userId', 'firstname lastname profileImage').lean();
    const mapped = reviews.map((r: any) => ({
      id: r._id,
      user: {
        id: r.userId?._id,
        firstname: r.userId?.firstname || '',
        lastname: r.userId?.lastname || '',
        profileImage: r.userId?.profileImage || null,
      },
      foodId: r.foodId,
      star: r.star ?? null,
      feedback: r.feedback ?? '',
      updatedAt: r.updatedAt,
      createdAt: r.createdAt,
    }));
    return { total: mapped.length, items: mapped };
  }

  /** Admin only — delete a review by its id */
  async deleteReview(reviewId: string) {
    if (!Types.ObjectId.isValid(reviewId)) throw new BadRequestException('Invalid review id');
    const rev = await this.reviewModel.findByIdAndDelete(reviewId);
    if (!rev) throw new NotFoundException('Review not found');

    // recompute food rating for that food
    await this.recomputeFoodRating(rev.foodId.toString());
    return { message: 'Review deleted' };
  }

  /** recompute average star and count and store on Food doc */
  private async recomputeFoodRating(foodId: string) {
    const agg = await this.reviewModel.aggregate([
      { $match: { foodId: new Types.ObjectId(foodId) } },
      {
        $group: {
          _id: '$foodId',
          avgStar: { $avg: '$star' },
          count: { $sum: 1 },
        },
      },
    ]);

    let avg = 0;
    let count = 0;
    if (agg[0]) {
      avg = agg[0].avgStar ? Number(agg[0].avgStar.toFixed(2)) : 0;
      count = agg[0].count;
    }

    await this.foodModel.findByIdAndUpdate(foodId, { rating: avg, reviewCount: count });
  }
}
