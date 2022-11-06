import {Filter, FilterExcludingWhere, repository} from '@loopback/repository';
import {
  del,
  get,
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
      if (!newReview) throw new Error('Cannot create new review');

      return {
        data: newReview,
        status: true,
        message: 'Movie has been created.',
      };
    } catch (err) {
      return {data: [], status: false, message: err};
    }
  }

  @get('/review')
  @response(200, {
    description: 'Array of Review model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Review, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(Review) filter?: Filter<Review>): Promise<Review[]> {
    return this.reviewRepository.find(filter);
  }

  @get('/review/{id}')
  @response(200, {
    description: 'Review model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Review, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Review, {exclude: 'where'})
    filter?: FilterExcludingWhere<Review>,
  ): Promise<Review> {
    return this.reviewRepository.findById(id, filter);
  }

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

  @del('/review/{id}')
  @response(204, {
    description: 'Review DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.reviewRepository.deleteById(id);
  }
}
