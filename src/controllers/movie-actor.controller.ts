import {authenticate} from '@loopback/authentication';
import {Filter, repository} from '@loopback/repository';
import {get, getModelSchemaRef, param, post, requestBody} from '@loopback/rest';
import {Actor, Movie} from '../models';
import {MovieActorRepository, MovieRepository} from '../repositories';
import {CustomResponse} from '../services/types';

export class MovieActorController {
  constructor(
    @repository(MovieRepository) protected movieRepository: MovieRepository,
    @repository(MovieActorRepository)
    protected movieActorRepository: MovieActorRepository,
  ) {}

  // Returns all the actors from the movie
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

  // inserts all the actors based on the movie id
  @authenticate('jwt')
  @post('/movie/{id}/actors', {
    responses: {
      '200': {
        description: 'create an Actor model instance',
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
      let movieActorsList = await this.movieRepository.actors(id).find();
      movieActorsList.forEach(async actor => {
        // remove all the actors on the collection
        await this.movieRepository.actors(id).unlink(actor.id);
      });

      // adds a new list of actors to collection
      actors.forEach(actor => this.movieRepository.actors(id).link(actor.id));

      return {
        data: [],
        status: true,
        message: 'Movie has been updated',
      };
    } catch (err) {
      return {data: [], status: false, message: err};
    }
  }
}
