import {UserService} from '@loopback/authentication';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {compare} from 'bcryptjs';
import {Credential} from '../models/credential.model';
import {Usercustom} from '../models/usercustom.model';
import {UsercustomRepository} from '../repositories';

export class MyCustomService implements UserService<Usercustom,Credential> {

  constructor(@repository(UsercustomRepository)
  public usercustomRepository : UsercustomRepository){

  }

  async verifyCredentials(credentials:Credential ): Promise<Usercustom> {

    const invalidCredentialsError = 'Invalid email or password.';

    const foundUser = await this.usercustomRepository.findOne({
      where: {email: credentials.email},
    });

    if (!foundUser) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    const credentialsFound = await this.usercustomRepository.findCredentials(
      foundUser.id,
    );

    if (!credentialsFound) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    const passwordMatched = await compare(
      credentials.password,
      credentialsFound.password,
    );

    if (!passwordMatched) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    return foundUser;
  }

  convertToUserProfile(user: Usercustom): UserProfile {
    //throw new Error('Method not implemented.');

    return {
      [securityId]: '' + user.id,
      email:user.email,
      username:user.username,
      roles: user.roles
    };
  }

}
