import {Getter, inject} from '@loopback/core';
import {
  DefaultCrudRepository,
  HasManyRepositoryFactory,
  repository, HasManyThroughRepositoryFactory} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Movie, MovieRelations, Review, Actor, MovieActor} from '../models';
import {ReviewRepository} from './review.repository';
import {MovieActorRepository} from './movie-actor.repository';
import {ActorRepository} from './actor.repository';

export class MovieRepository extends DefaultCrudRepository<
  Movie,
  typeof Movie.prototype.id,
  MovieRelations
> {
  public readonly reviews: HasManyRepositoryFactory<
    Review,
    typeof Movie.prototype.id
  >;

  public readonly actors: HasManyThroughRepositoryFactory<Actor, typeof Actor.prototype.id,
          MovieActor,
          typeof Movie.prototype.id
        >;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
    @repository.getter('ReviewRepository')
    protected reviewRepositoryGetter: Getter<ReviewRepository>, @repository.getter('MovieActorRepository') protected movieActorRepositoryGetter: Getter<MovieActorRepository>, @repository.getter('ActorRepository') protected actorRepositoryGetter: Getter<ActorRepository>,
  ) {
    super(Movie, dataSource);
    this.actors = this.createHasManyThroughRepositoryFactoryFor('actors', actorRepositoryGetter, movieActorRepositoryGetter,);
    this.registerInclusionResolver('actors', this.actors.inclusionResolver);
    this.reviews = this.createHasManyRepositoryFactoryFor(
      'reviews',
      reviewRepositoryGetter,
    );
    this.registerInclusionResolver('reviews', this.reviews.inclusionResolver);
  }
}
