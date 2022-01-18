import {Model, model, property} from '@loopback/repository';

@model({settings: {strict: false}})
export class Userlogin extends Model {
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

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Userlogin>) {
    super(data);
  }
}

export interface UserloginRelations {
  // describe navigational properties here
}

export type UserloginWithRelations = Userlogin & UserloginRelations;
