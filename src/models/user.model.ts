import {Entity, hasMany, hasOne, model, property} from '@loopback/repository';
import {Review} from './review.model';
import {UserCredentials} from './user-credentials.model';

@model()
export class User extends Entity {
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
  name: string;

  @property({
    type: 'string',
    required: true,
    format: 'email',
  })
  email: string;

  @property({
    type: 'string',
    required: true,
  })
  password: string;

  @property({
    type: 'string',
    required: true,
  })
  role: string;

  @hasMany(() => Review)
  reviews: Review[];

  @hasOne(() => UserCredentials, {keyTo: 'userId'})
  userCredentials: UserCredentials;
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
