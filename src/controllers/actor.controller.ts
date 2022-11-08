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
import {Actor} from '../models';
import {ActorRepository, MovieRepository} from '../repositories';
import {CustomResponse} from '../services/types';

export class ActorController {
  constructor(
    @repository(MovieRepository) protected movieRepository: MovieRepository,
    @repository(ActorRepository)
    public actorRepository: ActorRepository,
  ) {}

  // This is for creating new actor
  @authenticate('jwt')
  @post('/actor')
  @response(200, {
    description: 'Actor model instance',
    content: {'application/json': {schema: getModelSchemaRef(Actor)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Actor, {
            title: 'NewActor',
            exclude: ['id'],
          }),
        },
      },
    })
    actor: Omit<Actor, 'id'>,
  ): Promise<CustomResponse> {
    try {
      if (!actor.firstName) throw 'First name is required';
      if (!actor.lastName) throw 'Last name is required';
      if (!actor.gender) throw 'Gender is required';
      if (actor.age === 0) throw 'Age is required';
      if (!actor.image) throw 'Actor image is required';

      let newActor = await this.actorRepository.create(actor);

      if (!newActor)
        throw new Error("There's an error while creating a new actor");

      return {
        data: newActor,
        status: true,
        message: 'New actor has been created',
      };
    } catch (err) {
      return {data: [], status: false, message: err.message};
    }
  }

  // This will return all the actors
  @get('/actor')
  @response(200, {
    description: 'Array of Actor model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Actor, {includeRelations: true}),
        },
      },
    },
  })
  async findAll(
    @param.filter(Actor) filter?: Filter<Actor>,
  ): Promise<CustomResponse> {
    try {
      const actors = await this.actorRepository.find({
        include: ['movies'],
      });

      return {data: actors, status: true, message: 'Actors has been fetched'};
    } catch (err) {
      return {data: [], status: false, message: 'No actors found'};
    }
  }

  // It is used to search for the actors based on the parameter given
  @get('/actor/{name}')
  @response(200, {
    description: 'Array of Searched Actor model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Actor, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.path.string('name') name: string,
    @param.filter(Actor) filter?: Filter<Actor>,
  ): Promise<CustomResponse> {
    const pattern = new RegExp('^' + name + '.*', 'i');
    const actors = await this.actorRepository.find({
      where: {firstName: {regexp: pattern}}, // search an actor by its firstName
    });
    return {data: actors, status: true, message: ''};
  }

  // it will return all the details of the actor based on its id
  @get('/actor/details/{id}')
  @response(200, {
    description: 'Actor model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Actor, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Actor, {exclude: 'where'})
    filter?: FilterExcludingWhere<Actor>,
  ): Promise<CustomResponse> {
    try {
      let actor = await this.actorRepository.findById(id, filter);

      return {
        data: actor,
        status: true,
        message: 'Actor details has been fetched',
      };
    } catch (err) {
      return {
        data: [],
        status: false,
        message: "Can't find the actor's details",
      };
    }
  }

  // it will update the actor's details
  @authenticate('jwt')
  @patch('/actor/{id}')
  @response(204, {
    description: 'Actor PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Actor, {partial: true}),
        },
      },
    })
    actor: Actor,
  ): Promise<CustomResponse> {
    try {
      await this.actorRepository.updateById(id, actor);

      return {
        data: [],
        status: true,
        message: 'Actor details has been edited',
      };
    } catch (err) {
      return {data: [], status: false, message: "Can't update actor details"};
    }
  }

  // Deletes the actor details but checks if the actor still have movies
  @authenticate('jwt')
  @del('/actor/{id}')
  @response(204, {
    description: 'Actor DELETE success',
  })
  async deleteById(
    @param.path.string('id') id: string,
  ): Promise<CustomResponse> {
    try {
      let actorMovies = await this.actorRepository.movies(id).find();
      if (actorMovies.length > 0) throw 'Actor still have movies associated';

      await this.actorRepository.deleteById(id);

      return {
        data: [],
        status: true,
        message: 'Actor has been deleted',
      };
    } catch (err) {
      return {data: [], status: false, message: err};
    }
  }
}
