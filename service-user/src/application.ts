import {AuthenticationComponent} from '@loopback/authentication';
import {JWTAuthenticationComponent, RefreshTokenConstants, TokenServiceBindings} from '@loopback/authentication-jwt';
import {AuthorizationComponent} from '@loopback/authorization';
import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {Db1DataSource} from './datasources/db1.datasource';
import {UserServiceBindings} from './namespaces/custom.namespaces';
import {TokenServiceConstants} from './namespaces/token.namespaces';
import {MySequence} from './sequence';
import {JWTCustomService} from './services/jwt.service';
import {MyCustomService} from './services/myservice.service';

const configLoad = require('config');

export const appConfigEnv = configLoad.get('app');

export {ApplicationConfig};

export class UserapiApplication extends BootMixin(

  ServiceMixin(RepositoryMixin(RestApplication)),
) {


  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

     // Mount authentication system
    this.component(AuthenticationComponent);
     // Mount authorization system
    this.component(AuthorizationComponent);

    // Mount jwt component
    this.component(JWTAuthenticationComponent);

    // Bind datasource
    this.dataSource(Db1DataSource, UserServiceBindings.DATASOURCE_NAME);

    //new

    this.bind(UserServiceBindings.USER_SERVICE).toClass(MyCustomService);

    this.bind(TokenServiceBindings.TOKEN_SECRET).to(
      TokenServiceConstants.TOKEN_SECRET_VALUE,
    );

    this.bind(TokenServiceBindings.TOKEN_EXPIRES_IN).to(
      TokenServiceConstants.TOKEN_EXPIRES_IN_VALUE,
    );

    this.bind(TokenServiceBindings.TOKEN_SERVICE).toClass(JWTCustomService);

    this.bind(RefreshTokenConstants.REFRESH_SECRET_VALUE).to(TokenServiceConstants.REFRESH_SECRET_VALUE);

    this.bind(RefreshTokenConstants.REFRESH_EXPIRES_IN_VALUE).to(TokenServiceConstants.TOKEN_EXPIRES_IN_VALUE);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }
}
