import {Model, model, property} from '@loopback/repository';

@model({settings: {strict: false}})
export class Usersignup extends Model {
  @property({
    type: 'string',
    required: true,
  })
  username: string;

  @property({
    type: 'string',
    required: true,
  })
  email: string;

  @property({
    type: 'string',
    required: true,
  })
  password: string;

  @property({
    type: 'array',
    itemType: 'string',
  })
  roles?: string[];

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Usersignup>) {
    super(data);
  }
}

export interface UsersignupRelations {
  // describe navigational properties here
}

export type UsersignupWithRelations = Usersignup & UsersignupRelations;
