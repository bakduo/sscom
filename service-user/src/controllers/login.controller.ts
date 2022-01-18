// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/core';
import {authenticate} from '@loopback/authentication';
import {TokenServiceBindings} from '@loopback/authentication-jwt';
import {authorize} from '@loopback/authorization';
import {inject} from '@loopback/core';
import {model, property, repository} from '@loopback/repository';
import {get, getModelSchemaRef, HttpErrors, param, post, requestBody, response} from '@loopback/rest';
import {genSalt, hash} from 'bcryptjs';
import _ from 'lodash';
import {controlRole} from '../middlewares/auth';
import {Credential} from '../models';
import {Userlogin} from '../models/userlogin.model';
import {Usersignup} from '../models/usersignup.model';
import {UserServiceBindings} from '../namespaces/custom.namespaces';
import {UsercustomRepository} from '../repositories/usercustom.repository';
import {JWTCustomService} from '../services/jwt.service';
import {MyCustomService} from '../services/myservice.service';


@model()
export class SignUserResponse {
  @property({
    type: 'string',
    required: true,
  })
  email: string;
  @property({
    type: 'boolean',
    required: true,
  })
  status: boolean;
}

@model()
export class LoginUserResponse {
  @property({
    type: 'string',
    required: true,
  })
  token: string;
  @property({
    type: 'boolean',
    required: true,
  })
  status: boolean;
}

@model()
export class UserDisable {
  @property({
    type: 'string',
    required: true,
  })
  email: string;
}

@model()
export class UserResponse {
  @property({
    type: 'string',
    required: true,
  })
  email: string;
  @property({
    type: 'boolean',
    required: true,
  })
  status: boolean;
}

export class LoginController {
  constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: JWTCustomService,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: MyCustomService,
    @repository(UsercustomRepository)
    public usercustomRepository : UsercustomRepository) {}

  @post('/api/login')
  @response(200, {
    description: 'Usercustom model instance',
    content: {'application/json': {schema: getModelSchemaRef(Userlogin)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Userlogin, {
            title: 'NewUserLogin',
          }),
        },
      },
    })
    usercustom: Userlogin,
  ): Promise<LoginUserResponse> {

      const userCheck = await this.userService.verifyCredentials(new Credential({
        email:usercustom.email,
        password:usercustom.password}));

      const userProfile = this.userService.convertToUserProfile(userCheck);

      const token = await this.jwtService.generateToken(userProfile);

      return {token:token,status:true}

      //return this.usercustomRepository.create(usercustom);
      //throw new HttpErrors.Conflict('Invalid user.');

  }

  @post('/api/signup')
  @response(200, {
    description: 'Usercustom model instance',
    content: {'application/json': {schema: getModelSchemaRef(Usersignup)}},
  })
  async register(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usersignup, {
            title: 'NewUserSignup',
          }),
        },
      },
    })
    usersignup: Usersignup,
  ): Promise<SignUserResponse> {

    const password = await hash(usersignup.password, await genSalt());

    const savedUser = await this.usercustomRepository.create(
      _.omit(usersignup, 'password'),);

    await this.usercustomRepository.credential(savedUser.id).create(
      {email:usersignup.email,password:password
      });

    return {email:usersignup.email,status:true}
  }



  @post('/api/disable')
  @response(200, {
    description: 'Usercustom model instance',
    content: {'application/json': {schema: getModelSchemaRef(UserDisable)}},
  })
  async disable(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserDisable, {
            title: 'NewUserDisabled',
          }),
        },
      },
    })
    usercustom: UserDisable,
  ): Promise<UserResponse> {

    const user = await this.usercustomRepository.findOne({where:{'email':usercustom.email}});

    if (user){

      await this.usercustomRepository.credential(user.id).delete();

      await this.usercustomRepository.deleteById(user.id);

      return  {email:user.email,status:true}

    }

    throw new HttpErrors.Conflict("User don't exists.");
  }

  @authenticate('jwt')
  @authorize({
    allowedRoles: ['admin'],
    voters: [controlRole],
  })
  @get('/api/user/{email}', {
    responses: {
      '200': {
        description: 'User',
        content: {
          'application/json': {
            schema: {
              'x-ts-type': UserResponse,
            },
          },
        },
      },
    },
  })

  async findById(@param.path.string('email') email: string): Promise<UserResponse> {

    const userRemote = await this.usercustomRepository.findOne({where:{'email':email}});

    if (userRemote){

      return {email:userRemote.email,status:true}
    }

    throw new HttpErrors.Conflict("User don't exists.");

  }


}
