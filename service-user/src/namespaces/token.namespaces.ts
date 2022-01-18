import crypto from 'crypto';

const configLoad = require('config');

export const appConfigEnv = configLoad.get('app');

const secretTokenRefresh = appConfigEnv.jwt_secret_refresh ?? crypto.randomBytes(32).toString('hex');

const secretToken = appConfigEnv.jwt_secret ?? crypto.randomBytes(32).toString('hex');

const timeToken =  appConfigEnv.time_token ?? '3600';

export namespace TokenServiceConstants {
  export const TOKEN_SECRET_VALUE = secretToken;
  export const TOKEN_EXPIRES_IN_VALUE = timeToken;
  export const REFRESH_SECRET_VALUE = secretTokenRefresh;
}
