import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Review, User} from '../models';
import {ReviewRepository} from '../repositories';
import {CustomResponse} from '../services/types';

export class ReviewUserController {
  constructor(
    @repository(ReviewRepository)
    public reviewRepository: ReviewRepository,
  ) {}

  @get('/reviews/{id}/user', {
    responses: {
      '200': {
        description: 'User belonging to Review',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(User)},
          },
        },
      },
    },
  })
  // returns the writer of the review based on id
  async getUser(
    @param.path.string('id') id: typeof Review.prototype.id,
  ): Promise<CustomResponse> {
    try {
      await this.reviewRepository.user(id);
      return {
        data: [],
        status: true,
        message: `User of this review has been fetched`,
      };
    } catch (err) {
      return {data: [], status: false, message: err};
    }
  }
}
