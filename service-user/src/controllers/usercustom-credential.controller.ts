import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody
} from '@loopback/rest';
import {controlRole} from '../middlewares/auth';
import {
  Credential, Usercustom
} from '../models';
import {UsercustomRepository} from '../repositories';

export class UsercustomCredentialController {
  constructor(
    @repository(UsercustomRepository) protected usercustomRepository: UsercustomRepository,
  ) { }


  @authenticate('jwt')
  @authorize({
    allowedRoles: ['admin'],
    voters: [controlRole],
  })
  @get('/usercustoms/{id}/credential', {
    responses: {
      '200': {
        description: 'Usercustom has one Credential',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Credential),
          },
        },
      },
    },
  })
  async get(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Credential>,
  ): Promise<Credential> {
    return this.usercustomRepository.credential(id).get(filter);
  }


  @authenticate('jwt')
  @authorize({
    allowedRoles: ['admin'],
    voters: [controlRole],
  })
  @post('/usercustoms/{id}/credential', {
    responses: {
      '200': {
        description: 'Usercustom model instance',
        content: {'application/json': {schema: getModelSchemaRef(Credential)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Usercustom.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Credential, {
            title: 'NewCredentialInUsercustom',
            exclude: ['id'],
            optional: ['usercustomId']
          }),
        },
      },
    }) credential: Omit<Credential, 'id'>,
  ): Promise<Credential> {
    return this.usercustomRepository.credential(id).create(credential);
  }


  @authenticate('jwt')
  @authorize({
    allowedRoles: ['admin'],
    voters: [controlRole],
  })
  @patch('/usercustoms/{id}/credential', {
    responses: {
      '200': {
        description: 'Usercustom.Credential PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Credential, {partial: true}),
        },
      },
    })
    credential: Partial<Credential>,
    @param.query.object('where', getWhereSchemaFor(Credential)) where?: Where<Credential>,
  ): Promise<Count> {
    return this.usercustomRepository.credential(id).patch(credential, where);
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: ['admin'],
    voters: [controlRole],
  })
  @del('/usercustoms/{id}/credential', {
    responses: {
      '200': {
        description: 'Usercustom.Credential DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Credential)) where?: Where<Credential>,
  ): Promise<Count> {
    return this.usercustomRepository.credential(id).delete(where);
  }
}
