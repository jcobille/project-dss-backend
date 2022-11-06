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
import {ActorRepository} from '../repositories';
import {CustomResponse} from '../services/types';

export class ActorController {
  constructor(
    @repository(ActorRepository)
    public actorRepository: ActorRepository,
  ) {}

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
      let newActor = await this.actorRepository.create(actor);

      if (!newActor)
        throw new Error("There's an error while creating a new actor");

      return {
        data: newActor,
        status: true,
        message: 'New actor has been created',
      };
    } catch (err) {
      return {data: [], status: false, message: err};
    }
  }

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
    const actors = await this.actorRepository.find();
    return {data: actors, status: true, message: ''};
  }

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
      where: {firstName: {regexp: pattern}},
    });
    return {data: actors, status: true, message: ''};
  }

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

      if (!actor)
        throw new Error("There's an error while fetching actor's details");

      return {
        data: actor,
        status: true,
        message: 'Actor details has been fetched',
      };
    } catch (err) {
      return {data: [], status: false, message: err};
    }
  }

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
        message: 'Actor has been edited',
      };
    } catch (err) {
      return {data: [], status: false, message: err};
    }
  }

  @authenticate('jwt')
  @del('/actor/{id}')
  @response(204, {
    description: 'Actor DELETE success',
  })
  async deleteById(
    @param.path.string('id') id: string,
  ): Promise<CustomResponse> {
    try {
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
