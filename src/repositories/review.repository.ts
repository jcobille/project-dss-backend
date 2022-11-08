import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Review, ReviewRelations, User} from '../models';
import {UserRepository} from './user.repository';

export class ReviewRepository extends DefaultCrudRepository<
  Review,
  typeof Review.prototype.id,
  ReviewRelations
> {

  public readonly user: BelongsToAccessor<User, typeof Review.prototype.id>;

  constructor(@inject('datasources.db') dataSource: DbDataSource, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,) {
    super(Review, dataSource);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter,);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
  }
}
