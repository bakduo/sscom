import {Getter, inject} from '@loopback/core';
import {DefaultCrudRepository, HasOneRepositoryFactory, repository} from '@loopback/repository';
import {Db1DataSource} from '../datasources';
import {Credential, Usercustom, UsercustomRelations} from '../models';
import {CredentialRepository} from './credential.repository';

export class UsercustomRepository extends DefaultCrudRepository<
  Usercustom,
  typeof Usercustom.prototype.id,
  UsercustomRelations
> {

  public readonly credential: HasOneRepositoryFactory<Credential, typeof Usercustom.prototype.id>;

  constructor(
    @inject('datasources.db1') dataSource: Db1DataSource, @repository.getter('CredentialRepository') protected credentialRepositoryGetter: Getter<CredentialRepository>,
  ) {
    super(Usercustom, dataSource);
    this.credential = this.createHasOneRepositoryFactoryFor('credential', credentialRepositoryGetter);
    this.registerInclusionResolver('credential', this.credential.inclusionResolver);
  }

  async findCredentials(
    userId: typeof Usercustom.prototype.id,
  ): Promise<Credential | undefined> {
    try {
      return await this.credential(userId).get();
    } catch (err) {
      if (err.code === 'ENTITY_NOT_FOUND') {
        return undefined;
      }
      throw err;
    }
  }
}
