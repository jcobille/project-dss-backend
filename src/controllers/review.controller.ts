import {repository} from '@loopback/repository';
import {
  getModelSchemaRef,
  param,
  patch,
  post,
  requestBody,
  response,
} from '@loopback/rest';
import {Review} from '../models';
import {ReviewRepository} from '../repositories';
import {CustomResponse} from '../services/types';

export class ReviewController {
  constructor(
    @repository(ReviewRepository)
    public reviewRepository: ReviewRepository,
  ) {}

  // creates a new review from a user
  @post('/review')
  @response(200, {
    description: 'Review model instance',
    content: {'application/json': {schema: getModelSchemaRef(Review)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Review, {
            title: 'NewReview',
            exclude: ['id'],
          }),
        },
      },
    })
    review: Omit<Review, 'id'>,
  ): Promise<CustomResponse> {
    review = {...review, status: 'checking'};
    try {
      let newReview = await this.reviewRepository.create(review);
      if (!newReview) throw 'Cannot create new review';

      return {
        data: newReview,
        status: true,
        message: 'Movie has been created.',
      };
    } catch (err) {
      return {data: [], status: false, message: err};
    }
  }

  // Approves or decline a review
  @patch('/review/{id}')
  @response(204, {
    description: 'Review PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Review, {partial: true}),
        },
      },
    })
    review: Review,
  ): Promise<CustomResponse> {
    try {
      await this.reviewRepository.updateById(id, review);
      return {
        data: [],
        status: true,
        message: `Review has been ${review.status}`,
      };
    } catch (err) {
      return {data: [], status: false, message: err};
    }
  }
}
