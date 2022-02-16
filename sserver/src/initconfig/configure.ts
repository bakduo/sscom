import config from 'config';
import { CipherPayload } from '../utils/cipher';

export interface IConfigure {
    secure:boolean,
    encrypt:{
        algorithm:string;
        secretKey:string;
        iv?:string;
    },
}

export const appconfig:IConfigure = config.get('app');

export const encrypt= new CipherPayload({
    algorithm:appconfig.encrypt.algorithm,
    secretKey:appconfig.encrypt.secretKey
});
