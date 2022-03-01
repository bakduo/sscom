import {
  AuthorizationContext,
  AuthorizationDecision,
  AuthorizationMetadata
} from '@loopback/authorization';
import {securityId} from '@loopback/security';
import _ from 'lodash';
import {UserCustomProfile} from '../services/jwt.service';


export async function controlRole(
  authorizationCtx: AuthorizationContext,
  metadata: AuthorizationMetadata,
): Promise<AuthorizationDecision> {
  // No access if authorization details are missing
  let currentUser: UserCustomProfile;
  console.log(authorizationCtx.principals);
  if (authorizationCtx.principals.length > 0) {
    const user = _.pick(authorizationCtx.principals[0], [
      'id',
      'email',
      'roles',
    ]);
    console.log(user);
    currentUser = {[securityId]: user.id, email: user.email, roles: user.roles};
  } else {
    return AuthorizationDecision.DENY;
  }

  if (!currentUser.roles) {
    return AuthorizationDecision.DENY;
  }

  // Authorize everything that does not have a allowedRoles property
  if (!metadata.allowedRoles) {
    return AuthorizationDecision.ALLOW;
  }

  let roleIsAllowed = false;
  currentUser.roles.forEach((item:string) => {
    if (metadata.allowedRoles!.includes(item)){
      roleIsAllowed = true;
    }
  });
  // if (metadata.allowedRoles!.includes(currentUser.role)) {
  //   roleIsAllowed = true;
  // }

  if (!roleIsAllowed) {
    return AuthorizationDecision.DENY;
  }

  return AuthorizationDecision.ALLOW;
}
