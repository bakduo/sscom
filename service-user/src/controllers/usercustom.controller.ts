import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where
} from '@loopback/repository';
import {
  del, get,
  getModelSchemaRef, param, patch, post, put, requestBody,
  response
} from '@loopback/rest';
import {controlRole} from '../middlewares/auth';
import {Usercustom} from '../models';
import {UsercustomRepository} from '../repositories';

export class UsercustomController {
  constructor(
    @repository(UsercustomRepository)
    public usercustomRepository : UsercustomRepository,
  ) {}

  @authenticate('jwt')
  @authorize({
    allowedRoles: ['admin'],
    voters: [controlRole],
  })
  @post('/usercustoms')
  @response(200, {
    description: 'Usercustom model instance',
    content: {'application/json': {schema: getModelSchemaRef(Usercustom)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usercustom, {
            title: 'NewUsercustom',
            exclude: ['id'],
          }),
        },
      },
    })
    usercustom: Omit<Usercustom, 'id'>,
  ): Promise<Usercustom> {
    return this.usercustomRepository.create(usercustom);
  }

  @authenticate('jwt')
  @get('/usercustoms/count')
  @response(200, {
    description: 'Usercustom model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Usercustom) where?: Where<Usercustom>,
  ): Promise<Count> {
    return this.usercustomRepository.count(where);
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: ['admin'],
    voters: [controlRole],
  })
  @get('/usercustoms')
  @response(200, {
    description: 'Array of Usercustom model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Usercustom, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Usercustom) filter?: Filter<Usercustom>,
  ): Promise<Usercustom[]> {
    return this.usercustomRepository.find(filter);
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: ['admin'],
    voters: [controlRole],
  })
  @patch('/usercustoms')
  @response(200, {
    description: 'Usercustom PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usercustom, {partial: true}),
        },
      },
    })
    usercustom: Usercustom,
    @param.where(Usercustom) where?: Where<Usercustom>,
  ): Promise<Count> {
    return this.usercustomRepository.updateAll(usercustom, where);
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: ['admin'],
    voters: [controlRole],
  })
  @get('/usercustoms/{id}')
  @response(200, {
    description: 'Usercustom model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Usercustom, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Usercustom, {exclude: 'where'}) filter?: FilterExcludingWhere<Usercustom>
  ): Promise<Usercustom> {
    return this.usercustomRepository.findById(id, filter);
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: ['admin'],
    voters: [controlRole],
  })
  @patch('/usercustoms/{id}')
  @response(204, {
    description: 'Usercustom PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usercustom, {partial: true}),
        },
      },
    })
    usercustom: Usercustom,
  ): Promise<void> {
    await this.usercustomRepository.updateById(id, usercustom);
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: ['admin'],
    voters: [controlRole],
  })
  @put('/usercustoms/{id}')
  @response(204, {
    description: 'Usercustom PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() usercustom: Usercustom,
  ): Promise<void> {
    await this.usercustomRepository.replaceById(id, usercustom);
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: ['admin'],
    voters: [controlRole],
  })
  @del('/usercustoms/{id}')
  @response(204, {
    description: 'Usercustom DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.usercustomRepository.deleteById(id);
  }
}
