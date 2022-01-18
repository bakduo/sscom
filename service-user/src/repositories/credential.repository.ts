import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {Db1DataSource} from '../datasources';
import {Credential, CredentialRelations} from '../models';

export class CredentialRepository extends DefaultCrudRepository<
  Credential,
  typeof Credential.prototype.id,
  CredentialRelations
> {
  constructor(
    @inject('datasources.db1') dataSource: Db1DataSource,
  ) {
    super(Credential, dataSource);
  }
}
