import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {MovieActor, MovieActorRelations} from '../models';

export class MovieActorRepository extends DefaultCrudRepository<
  MovieActor,
  typeof MovieActor.prototype.id,
  MovieActorRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(MovieActor, dataSource);
  }
}
