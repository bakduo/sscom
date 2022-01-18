import {Entity, hasOne, model, property} from '@loopback/repository';
import {Credential} from './credential.model';

@model({settings: {strict: false}})
export class Usercustom extends Entity {
  @property({
    type: 'string',
    required: true,
  })
  email: string;

  @property({
    type: 'string',
    required: true,
  })
  username: string;

  @property({
    type: 'date',
  })
  createdat?: string;

  @property({
    type: 'date',
  })
  modifat?: string;

  @property({
    type: 'array',
    itemType: 'string',
  })
  roles?: string[];


  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @hasOne(() => Credential)
  credential: Credential;
  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Usercustom>) {
    super(data);
  }
}

export interface UsercustomRelations {
  // describe navigational properties here
}

export type UsercustomWithRelations = Usercustom & UsercustomRelations;
