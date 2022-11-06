import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {Actor, Movie} from '../models';
import {MovieActorRepository, MovieRepository} from '../repositories';
import {CustomResponse} from '../services/types';

export class MovieActorController {
  constructor(
    @repository(MovieRepository) protected movieRepository: MovieRepository,
    @repository(MovieActorRepository)
    protected movieActorRepository: MovieActorRepository,
  ) {}

  @get('/movies/{id}/actors', {
    responses: {
      '200': {
        description: 'Array of Movie has many Actor through MovieActor',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Actor)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Actor>,
  ): Promise<Actor[]> {
    return this.movieRepository.actors(id).find(filter);
  }

  @post('/movie/{id}/actors', {
    responses: {
      '200': {
        description: 'create a Actor model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Actor),
          },
        },
      },
    },
  })
  async linkActors(
    @param.path.string('id') id: typeof Movie.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: getModelSchemaRef(Actor, {
              title: 'NewActor',
            }),
          },
        },
      },
    })
    actors: Actor[],
  ): Promise<CustomResponse> {
    try {
      actors.forEach(actor => this.movieRepository.actors(id).link(actor.id));

      return {
        data: actors,
        status: true,
        message: 'Movie has been updated',
      };
    } catch (err) {
      return {data: [], status: false, message: err};
    }
  }

  @patch('/movies/{id}/actors', {
    responses: {
      '200': {
        description: 'Movie.Actor PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Actor, {partial: true}),
        },
      },
    })
    actor: Partial<Actor>,
    @param.query.object('where', getWhereSchemaFor(Actor)) where?: Where<Actor>,
  ): Promise<Count> {
    return this.movieRepository.actors(id).patch(actor, where);
  }

  @del('/movies/{id}/actors', {
    responses: {
      '200': {
        description: 'Movie.Actor DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Actor)) where?: Where<Actor>,
  ): Promise<Count> {
    return this.movieRepository.actors(id).delete(where);
  }
}
