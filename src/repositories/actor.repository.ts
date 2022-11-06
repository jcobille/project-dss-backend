import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyThroughRepositoryFactory} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Actor, ActorRelations, Movie, MovieActor} from '../models';
import {MovieActorRepository} from './movie-actor.repository';
import {MovieRepository} from './movie.repository';

export class ActorRepository extends DefaultCrudRepository<
  Actor,
  typeof Actor.prototype.id,
  ActorRelations
> {

  public readonly movies: HasManyThroughRepositoryFactory<Movie, typeof Movie.prototype.id,
          MovieActor,
          typeof Actor.prototype.id
        >;

  constructor(@inject('datasources.db') dataSource: DbDataSource, @repository.getter('MovieActorRepository') protected movieActorRepositoryGetter: Getter<MovieActorRepository>, @repository.getter('MovieRepository') protected movieRepositoryGetter: Getter<MovieRepository>,) {
    super(Actor, dataSource);
    this.movies = this.createHasManyThroughRepositoryFactoryFor('movies', movieRepositoryGetter, movieActorRepositoryGetter,);
    this.registerInclusionResolver('movies', this.movies.inclusionResolver);
  }
}
