import config from 'config';
import { CipherPayload, CipherBrowserPayload } from '../utils/cipher';

export interface IConfigure {
    port:number;
    secure:boolean;
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

export const encryptBrowser = new CipherBrowserPayload({
    algorithm:appconfig.encrypt.algorithm,
    secretKey:appconfig.encrypt.secretKey
});