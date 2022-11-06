import {Entity, model, property} from '@loopback/repository';

@model()
export class MovieActor extends Entity {
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
  movieId: string;

  @property({
    type: 'string',
    required: true,
  })
  actorId: string;


  constructor(data?: Partial<MovieActor>) {
    super(data);
  }
}

export interface MovieActorRelations {
  // describe navigational properties here
}

export type MovieActorWithRelations = MovieActor & MovieActorRelations;
