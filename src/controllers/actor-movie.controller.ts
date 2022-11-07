import {Filter, repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Movie} from '../models';
import {ActorRepository} from '../repositories';
import {CustomResponse} from '../services/types';

export class ActorMovieController {
  constructor(
    @repository(ActorRepository) protected actorRepository: ActorRepository,
  ) {}

  /* Returns all the movies of the actor */
  @get('/actors/{id}/movies', {
    responses: {
      '200': {
        description: 'Array of Actor has many Movie through MovieActor',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Movie)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Movie>,
  ): Promise<CustomResponse> {
    try {
      let movies = await this.actorRepository.movies(id).find();

      return {
        data: movies,
        status: true,
        message: 'Actor movies has been fetched',
      };
    } catch (err) {
      return {
        data: [],
        status: false,
        message: 'No movies for this actor found',
      };
    }
  }
}
