import config from 'config';
import crypto from 'crypto';
import {IConfigApp} from '../models/configure';

const configEnv:IConfigApp = config.get('app');

const secretTokenRefresh = configEnv.jwtSecretRefresh ?? crypto.randomBytes(32).toString('hex');

const secretToken = configEnv.jwtSecret ?? crypto.randomBytes(32).toString('hex');

const timeToken =  configEnv.timeToken ?? '3600';

export namespace TokenServiceConstants {
  export const TOKEN_SECRET_VALUE = secretToken;
  export const TOKEN_EXPIRES_IN_VALUE = timeToken;
  export const REFRESH_SECRET_VALUE = secretTokenRefresh;
}
