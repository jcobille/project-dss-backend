import {Entity, hasMany, model, property} from '@loopback/repository';
import {MovieActor} from './movie-actor.model';
import {Movie} from './movie.model';

@model()
export class Actor extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id: string;

  @property({
    type: 'string',
    required: true,
  })
  firstName: string;

  @property({
    type: 'string',
    required: true,
  })
  lastName: string;

  @property({
    type: 'string',
    required: true,
  })
  gender: string;

  @property({
    type: 'number',
    required: true,
  })
  age: number;

  @property({
    type: 'string',
  })
  image?: string;

  @hasMany(() => Movie, {through: {model: () => MovieActor}})
  movies: Movie[];

  constructor(data?: Partial<Actor>) {
    super(data);
  }
}

export interface ActorRelations {
  // describe navigational properties here
}

export type ActorWithRelations = Actor & ActorRelations;
