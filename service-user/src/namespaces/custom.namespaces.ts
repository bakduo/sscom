import {UserService} from '@loopback/authentication';
import {BindingKey} from '@loopback/core';
import {Credential} from '../models';
import {Usercustom} from '../models/usercustom.model';

export namespace UserServiceBindings {
  //https://loopback.io/doc/en/lb4/apidocs.context.bindingkey.create.html
  export const USER_SERVICE = BindingKey.create<
    UserService<Usercustom, Credential>
  >('services.myservice.service');

  export const DATASOURCE_NAME = '';

}

