import {Getter, inject} from '@loopback/core';
import {
  DefaultCrudRepository,
  HasManyRepositoryFactory,
  HasManyThroughRepositoryFactory,
  repository,
} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Actor, Movie, MovieActor, MovieRelations, Review} from '../models';
import {ActorRepository} from './actor.repository';
import {MovieActorRepository} from './movie-actor.repository';
import {ReviewRepository} from './review.repository';

export class MovieRepository extends DefaultCrudRepository<
  Movie,
  typeof Movie.prototype.id,
  MovieRelations
> {
  public readonly reviews: HasManyRepositoryFactory<
    Review,
    typeof Movie.prototype.id
  >;

  public readonly actors: HasManyThroughRepositoryFactory<
    Actor,
    typeof Actor.prototype.id,
    MovieActor,
    typeof Movie.prototype.id
  >;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
    @repository.getter('ReviewRepository')
    protected reviewRepositoryGetter: Getter<ReviewRepository>,
    @repository.getter('MovieActorRepository')
    protected movieActorRepositoryGetter: Getter<MovieActorRepository>,
    @repository.getter('ActorRepository')
    protected actorRepositoryGetter: Getter<ActorRepository>,
  ) {
    super(Movie, dataSource);
    this.actors = this.createHasManyThroughRepositoryFactoryFor(
      'actors',
      actorRepositoryGetter,
      movieActorRepositoryGetter,
    );
    this.registerInclusionResolver('actors', this.actors.inclusionResolver);
    this.reviews = this.createHasManyRepositoryFactoryFor(
      'reviews',
      reviewRepositoryGetter,
    );
    this.registerInclusionResolver('reviews', this.reviews.inclusionResolver);
  }
}
