import {Entity, model, property} from '@loopback/repository';

@model()
export class Review extends Entity {
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
  userId: string;

  @property({
    type: 'number',
    required: true,
  })
  reviewScore: number;

  @property({
    type: 'string',
    required: true,
  })
  description: string;

  @property({
    type: 'string',
    default: () => new Date(),
  })
  posted_date?: string;

  @property({
    type: 'string',
    required: false,
  })
  status: string;

  @property({
    type: 'string',
  })
  movieId?: string;

  constructor(data?: Partial<Review>) {
    super(data);
  }
}

export interface ReviewRelations {
  // describe navigational properties here
}

export type ReviewWithRelations = Review & ReviewRelations;
