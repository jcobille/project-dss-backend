import {
  Entity,
  hasMany,
  model,
  property,
  referencesMany,
} from '@loopback/repository';
import {Actor} from './actor.model';
import {Review} from './review.model';

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
    type: 'date',
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

  constructor(data?: Partial<Movie>) {
    super(data);
  }
}

export interface MovieRelations {
  // describe navigational properties here
}

export type MovieWithRelations = Movie & MovieRelations;
