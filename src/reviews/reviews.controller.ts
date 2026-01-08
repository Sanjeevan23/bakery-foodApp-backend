import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Param,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/roles.enum';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // POST /reviews — create or update current user's review for a food
  @UseGuards(JwtAuthGuard)
  @Post()
  async addOrUpdate(@Req() req: any, @Body() dto: CreateReviewDto) {
    const userId = req.user?.sub ?? req.user?.userId;
    if (!userId) throw new BadRequestException('Invalid user id in token');
    return this.reviewsService.addOrUpdateReview(userId, dto);
  }

  // GET /reviews/food/:foodId — public view of all reviews for a food with summary
  @Get('food/:foodId')
  async getByFood(@Param('foodId') foodId: string) {
    return this.reviewsService.getByFood(foodId);
  }

  // GET /reviews — public listing (paged could be added later)
  @Get()
  async getAll() {
    return this.reviewsService.getAll();
  }

  // DELETE /reviews/:id — admin only
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.reviewsService.deleteReview(id);
  }
}
