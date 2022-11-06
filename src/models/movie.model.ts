import {
  Entity,
  hasMany,
  model,
  property,
  referencesMany,
} from '@loopback/repository';
import {Actor} from './actor.model';
import {Review} from './review.model';
import {MovieActor} from './movie-actor.model';

@model()
export class Movie extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  title: string;

  @property({
    type: 'string',
    required: true,
  })
  description: string;

  @property({
    type: 'string',
    required: false,
  })
  cost: string;

  @property({
    type: 'string',
    required: true,
  })
  released_date: string;

  @property({
    type: 'number',
    required: true,
  })
  duration: number;

  @property({
    type: 'string',
    required: true,
  })
  image: string;

  @hasMany(() => Review)
  reviews: Review[];

  @referencesMany(() => Actor)
  actorIds: string[];

  @hasMany(() => Actor, {through: {model: () => MovieActor}})
  actors: Actor[];

  constructor(data?: Partial<Movie>) {
    super(data);
  }
}

export interface MovieRelations {
  // describe navigational properties here
}

export type MovieWithRelations = Movie & MovieRelations;
