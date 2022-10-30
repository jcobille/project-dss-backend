import {authenticate} from '@loopback/authentication';
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
import {Movie, Review} from '../models';
import {MovieRepository} from '../repositories';
export class MovieController {
  constructor(
    @repository(MovieRepository)
    public movieRepository: MovieRepository,
  ) {}

  @authenticate('jwt')
  @post('/movie')
  @response(200, {
    description: 'Movie model instance',
    content: {'application/json': {schema: getModelSchemaRef(Movie)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Movie, {
            title: 'NewMovie',
            exclude: ['id'],
          }),
        },
      },
    })
    movie: Omit<Movie, 'id'>,
  ): Promise<Movie> {
    return this.movieRepository.create(movie);
  }

  @get('/movie')
  @response(200, {
    description: 'Array of Movie model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Movie, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(Movie) filter?: Filter<Movie>): Promise<Movie[]> {
    return this.movieRepository.find(filter);
  }

  @get('/movie/{id}')
  @response(200, {
    description: 'Movie model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Movie, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Movie, {exclude: 'where'})
    filter?: FilterExcludingWhere<Movie>,
  ): Promise<Movie> {
    return this.movieRepository.findById(id, filter);
  }

  @authenticate('jwt')
  @patch('/movie/{id}')
  @response(204, {
    description: 'Movie PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Movie, {partial: true}),
        },
      },
    })
    movie: Movie,
  ): Promise<void> {
    await this.movieRepository.updateById(id, movie);
  }

  @authenticate('jwt')
  @del('/movie/{id}')
  @response(204, {
    description: 'Movie DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.movieRepository.deleteById(id);
  }

  @get('/movie/{id}/reviews', {
    responses: {
      '200': {
        description: 'Array of Movie has many Review',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Review)},
          },
        },
      },
    },
  })
  async findReviews(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Review>,
  ): Promise<Review[]> {
    return this.movieRepository.reviews(id).find(filter);
  }
}
